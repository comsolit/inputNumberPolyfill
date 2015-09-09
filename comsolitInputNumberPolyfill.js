(function() {

  function needsPolyfill()
  {
    // checks whether we're using an Internet Explorer 10+ or Edge
    return (
      !!document.documentMode && !!window.atob // IE10+ without Edge
      ) ||
      (!!navigator.msLaunchUri // WIN8+
        && !!window.atob // IE10+, Edge
      );
  }

  function hasRequiredAttributes(elem)
  {
    return elem.attr("type").toLowerCase() === "number" &&
      !isNaN(parseFloat(elem.attr("max"))) &&
      !isNaN(parseFloat(elem.attr("min"))) &&
      !isNaN(parseFloat(elem.attr("step")));
  }

  function createButton(value, modifierHandler)
  {
    var inlineStyle = "display: block; height: 10.7px; width: 14px; font-size: 10px; padding: 0px; line-height: 1 ; box-sizing: border-box";
    var button = document.createElement("input");
    button.setAttribute("type", "button");
    button.setAttribute("value", value);
    button.setAttribute("tabindex", "-1");
    button.setAttribute("style", inlineStyle);
    var element = angular.element(button);
    element.on("click", modifierHandler);

    return button;
  }

  function createContainerDiv()
  {
    var inlineStyle = "position: relative; margin-left: -5px";
    var div = document.createElement("div");
    div.setAttribute("class", "comsolit-input-number-polyfill-container");
    div.setAttribute("style", inlineStyle);

    return div;
  }

  function createSpan()
  {
    var inlineStyle = "position: absolute;";
    var span = document.createElement("span");
    span.setAttribute("style", inlineStyle);

    return span;
  }

  function isChildOfOrSame(parent, child)
  {
    var testElem = child;
    var steps = 3;

    for (;steps > 0; --steps) {
      if (!testElem) {
        return false;
      }
      if (parent === testElem) {
        return true;
      }
      testElem = testElem.parentElement;
    }

    return false;
  }

  var module = angular.module('comsolitInputNumberPolyfill', []);

  if(needsPolyfill()) module.directive(
    'input',
    function() {
      return {
        restrict : 'E',
        scope : {},
        link : function(scope, elem, attrs, ctrl)
        {
          var containerDiv = null;
          var inputElem = elem[0];
          var hiddenRangeInput;
          var hasMouse;

          function hasFocus()
          {
            return document.activeElement === inputElem;
          }

          // stepUp, stepDown in IE work only for the range input type
          function doStep(direction)
          {
            var value = elem.val();
            var min = elem.attr('min');
            var max = elem.attr('max');

            // TODO handle case where min or max is not set!
            if (value !== 0 && !value) {
              if(direction === 'up') {
                value = min;
              } else {
                value = max;
              }
            }

            hiddenRangeInput.setAttribute("min", min);
            hiddenRangeInput.setAttribute("max", max);
            hiddenRangeInput.setAttribute("value", value);
            hiddenRangeInput.setAttribute("step", elem.attr("step"));

            elem.after(hiddenRangeInput);
            if(direction === 'up') {
              hiddenRangeInput.stepUp();
            } else {
              hiddenRangeInput.stepDown();
            }

            hiddenRangeInputJquery = angular.element(hiddenRangeInput);
            elem.val(hiddenRangeInputJquery.val());

            var event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, false);
            inputElem.dispatchEvent(event);
          }

          function createButtonClickHandler(direction)
          {
            return function(event) {
              doStep(direction);
              inputElem.focus();
              event.preventDefault();

              return false;
            }
          }

          function createContainerWithButtons()
          {
            if (!hasRequiredAttributes(elem)) {
              return;
            }
            containerDiv = createContainerDiv();
            var span = createSpan();
            var btnUp = createButton('▴', createButtonClickHandler('up'));
            var btnDown = createButton('▾', createButtonClickHandler('down'));
            hiddenRangeInput = document.createElement("input");
            hiddenRangeInput.setAttribute("type", "range");
            hiddenRangeInput.setAttribute("style", "display:none;");

            span.appendChild(btnUp);
            span.appendChild(btnDown);
            containerDiv.appendChild(span);
            containerDiv.appendChild(hiddenRangeInput);
            elem.after(containerDiv);

            angular.element(containerDiv).on("mouseleave", function(event) {
              if (!event.relatedTarget || event.relatedTarget.parentElement !== inputElem) {
                deleteContainerWithButtons(elem);
              }
            });
          }

          function deleteContainerWithButtons()
          {
            if (!containerDiv) {
              return;
            }

            hiddenRangeInput = null;
            angular.element(containerDiv).remove();
            containerDiv = null;
            hasMouse = false;
          }

          function registerInputElemEventHandler()
          {
            elem.on("keydown", function(key) {
              if (key.keyCode === 38 ) {
                doStep('up');
              } else if (key.keyCode === 40) {
                doStep('down');
              }
            });

            elem.on("mouseenter", function() {
              hasMouse = true;
              if (containerDiv === null) {
                createContainerWithButtons();
              }
            });

            elem.on("mouseleave", function(event) {
              if (event.relatedTarget && isChildOfOrSame(containerDiv, event.relatedTarget)) {
                return;
              }
              if (hasFocus()) {
                hasMouse = false;
                return;
              }
              deleteContainerWithButtons();
            });

            elem.on("focus", function() {
              if (containerDiv === null) {
                createContainerWithButtons();
              }
            });
            elem.on("focusout", function() {
              if (hasMouse) {
                return;
              }
              deleteContainerWithButtons();
            });
          }

          if (hasRequiredAttributes(elem)) {
            registerInputElemEventHandler();
          }
        }
      }
    }
  );
})();
