'use strict';

angular.module('lr.upload.directives').directive('uploadButton', function(upload) {
  return {
    restrict: 'EA',
    scope: {
      data: '=?data',
      url: '@',
      param: '@',
      method: '@',
      onUpload: '&',
      onSuccess: '&',
      onError: '&',
      onComplete: '&'
    },
    link: function(scope, element, attr) {

      var el = angular.element(element);
      var fileInput = angular.element('<input type="file" />');
      el.append(fileInput);

      fileInput.on('change', function uploadButtonFileInputChange() {

        if (fileInput[0].files && fileInput[0].files.length === 0) {
          return;
        }

        var options = {
          url: scope.url,
          method: scope.method || 'POST',
          forceIFrameUpload: scope.$eval(attr.forceIframeUpload) || false,
          data: scope.data || {}
        };

        options.data[scope.param || 'file'] = fileInput;

        scope.$apply(function () {
          scope.onUpload({files: fileInput[0].files});
        });

        upload(options).then(
          function (response) {
            scope.onSuccess({response: response});
            scope.onComplete({response: response});
          },
          function (response) {
            scope.onError({response: response});
            scope.onComplete({response: response});
          }
        );
      });

      // Add required to file input and ng-invalid-required
      // Since the input is reset when upload is complete, we need to check something in the
      // onSuccess and set required="false" when we feel that the upload is correct
      attr.$observe('required', function uploadButtonRequiredObserve(value) {
        var required = scope.$eval(value);
        fileInput.attr('required', angular.isUndefined(required) || required);
        element.toggleClass('ng-valid', !required);
        element.toggleClass('ng-invalid ng-invalid-required', required);
      });

      attr.$observe('accept', function uploadButtonAcceptObserve(value) {
        fileInput.attr('accept', value);
      });

      if (upload.support.formData) {
        var uploadButtonMultipleObserve = function () {
          fileInput.attr('multiple', !!(scope.$eval(attr.multiple) && !scope.$eval(attr.forceIframeUpload)));
        };
        attr.$observe('multiple', uploadButtonMultipleObserve);
        attr.$observe('forceIframeUpload', uploadButtonMultipleObserve);
      }
    }
  };
});
