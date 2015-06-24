'use strict';

/**
 * @ngdoc overview
 * @name hcUiApp
 * @description
 * # hcUiApp
 *
 * Main module of the application.
 */
angular
  .module('hcUiApp', ['checklist-model','ui.slider','ui.bootstrap','blueimp.fileupload','ui.utils','ngAnimate','datatables','ngInputModified','ct.ui.router.extras','ui.router','ngMessages','cgBusy'])
  .constant('characterWhiteList', {
    charArray : ['A-Z','a-z','0-9',',','\\-','"','!','#','&','(',')','.','/',':',';','=','?','@','^','_','`','{','|','}','~',' ','\'','\\[','\\]','\\\\']
   })
  .config([
         '$httpProvider', 'fileUploadProvider','$provide', 'specialCharactersWhiteListServiceProvider','characterWhiteList',
          function ($httpProvider, fileUploadProvider, $provide, specialCharactersWhiteListServiceProvider,characterWhiteList) {
             specialCharactersWhiteListServiceProvider.setWhiteListCharacters(characterWhiteList.charArray);
             $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
             angular.extend(fileUploadProvider.defaults, {
            	 autoUpload : false,
                 maxFileSize: 5000000,
                 singleFileUploads: true,
                 handleResponse: function (e, data) {
                     var files = data.result && data.result.files;
                     if (files) {
                         data.scope.replace(data.files, files);
                     } else if (data.errorThrown ||
                             data.textStatus === 'error') {
                         data.files[0].error = JSON.parse(data.jqXHR.responseText);
                     }
                     else if (data.textStatus === 'success') {
                         data.files[0].success = JSON.parse(data.jqXHR.responseText);
                     }
                 }
             });
             $provide.decorator('$state', ["$delegate", "$stateParams", function($delegate, $stateParams) {
                 $delegate.forceReload = function() {
                     return $delegate.go($delegate.current, $stateParams, {
                         reload: true,
                         inherit: false,
                         notify: true
                     });
                 };
                 return $delegate;
             }]);
         }
     ])
  .value("dateFormat","MM/DD/YYYY");

'use strict';

/**
 * @ngdoc function
 * @name hcUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the hcUiApp
 */
angular.module('hcUiApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcCheckboxGroup
 * @description
 * # hcCheckboxGroup
 */
angular.module('hcUiApp')
  .directive('hcCheckboxGroup', ["templateURL","$http","$templateCache","$compile", function (templateURL, $http, $templateCache, $compile) {
    return {
      require : ['ngModel','hcCheckboxGroup'],
      restrict: 'E',
      scope : {
        items : '=',
        name: '@',
        id: '@'
      },
      controller : ["$scope", function($scope){
        this.getItems = function(){
          if(angular.isArray($scope.items)){
            var items = {};
            _.each($scope.items, function(value){
              items[value] = value;
            });
            return items;
          }
          return $scope.items;
        }
      }],
      link : function($scope, element, attrs, controllers){
        var ngModelController = controllers[0],
        hcCheckboxGroupController = controllers[1];
        $scope.resolvedItems = hcCheckboxGroupController.getItems();
        $scope.cbGroupModel = {};
        var keys = Object.keys($scope.resolvedItems),
        showAllFlag = false;
        if(keys.length > 1)
          showAllFlag = angular.isUndefined(attrs.showAll)? "true" : attrs.showAll;
        $scope.showAll = showAllFlag;
        $scope.allText = angular.isUndefined(attrs.allText)? "All" : attrs.allText;
        $scope.handleAllCB = function(){
          var all = $scope.all;
          if(! angular.isUndefined(all)){
            $scope.cbGroupModel.cbArr.length = 0;
            if(all === true){
              Array.prototype.push.apply($scope.cbGroupModel.cbArr, keys);
            }
          }
        };
        $scope.$watchCollection('cbGroupModel.cbArr', function(newValue){
          ngModelController.$setViewValue(newValue);
          if(! angular.isUndefined(newValue)){
            if(newValue.length === keys.length){
              $scope.all = true;
            }
            else{
              $scope.all = false;
            }
          }
        });
        ngModelController.$render = function(){
          $scope.cbGroupModel.cbArr = ngModelController.$viewValue || [];
        }
        $http.get(templateURL.getUrl("hc-checkbox-group-"+attrs.type),{
          cache: $templateCache
        }).success(function(result){
           element.html(result).show();
           $compile(element.contents())($scope);
        });
      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcInitial
 * @description
 * #Overview
 * 'hcInitial' directive initially filled the input elements with their initial values.
 *
 * @requires $parse
 * @requires ngModel
 * @restrict A
 *
 * @example
    <example module="hcUiApp">
     	<file name="index.html">
      		<form name="dummyForm">
		        Name: <input type="text" name="name" id="firstInput" ng-model="model.value1" value="Name" hc-initial="true">{{model.value1}}<br/>
		        Age: <input type="text" name="age" id="secondInput" ng-model="model.value2" value="60" hc-initial="true">{{model.value2}}<br/>
		        <input type="checkbox" name="checkValue" id="checkbox1" ng-model="model.value[0]" value="Father" hc-initial="true" checked="checked"> Father<br/>
		        <input type="checkbox" name="checkValue" id="checkbox2" ng-model="model.value[1]" value="Mother" hc-initial="true"> Mother<br/>
		        <input type="checkbox" name="checkValue" id="checkbox3" ng-model="model.value[2]" value="Brother" hc-initial="true"> Brother<br/>
		        <select name="month" id="select_month" ng-model="model.month" hc-initial="true" ng-disabled="disabled">
			      <option value="">MM</option>
			      <option value="01" selected>JAN</option>
			      <option value="02">FEB</option>
			      <option value="03">MARCH</option>
			      <option value="04">APRIL</option>
			      <option value="05">MAY</option>
			      <option value="06">JUNE</option>
			      <option value="07">JULY</option>
			      <option value="08">AUGUST</option>
			      <option value="09">SEPTEMBER</option>
			      <option value="10">OCTOBER</option>
			      <option value="11">NOVEMBER</option>
			      <option value="12">DECEMBER</option>
		      	</select>
	        </form>
     </file>
   </example>
 *
 *
 *
 */
angular.module('hcUiApp')
  .directive('hcInitial', ["$parse", function($parse) {
	return {
		restrict : 'A',
		require : 'ngModel',
		compile : function($element, $attrs) {
			var type = $attrs.type,
			initialValue;
			if(!(type && (type === 'radio') && !$attrs.checked)){
				initialValue = $attrs.value || $element.val();
			}
			return {
				pre : function($scope, $element, $attrs, ngModelController) {
					if(initialValue){
						if(initialValue.indexOf('[') === 0 || initialValue.indexOf('{') === 0){
							initialValue = JSON.parse(initialValue);
						}
						var ngModelVal = $parse($attrs.ngModel);
						if(ngModelVal($scope) == undefined){
							ngModelVal.assign($scope, initialValue);
						}
					}
				}
			};
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcQuotes
 * @description
 * # hcQuotes
 */
 angular.module('hcUiApp')
 .directive('hcQuotes', ["$compile", "$log","$rootScope", function ($compile, $log, $rootScope) {
  return {
    restrict: 'E',
    terminal: true,
    priority: 100,
    scope: true,
    require: "hcQuotes",
    controller : ["$scope","$attrs", "quotesService","$q", function($scope, $attrs, quotesService, $q){
      var typedQuotesService = quotesService.getService($attrs.type),
      intializeFilterCriteria = function(){
        return $scope.filterCriteria || {};
      },
      initializeSortCriteria = function(){
        return $scope.sortCriteria || {};
      },
      initializePaginationCriteria = function(){
        return $scope.paginationCriteria || {
          displayStart : 0,
          currentPage : 1
        };
      };
      angular.extend($scope, {
        type: $attrs.type,
        productCategory: $attrs.productCategory || $attrs.type,
        plans : [],
        filters : [],
        filteredQuotes : [],
        filterCriteria : intializeFilterCriteria(),
        sortingCriteria : initializeSortCriteria(),
        paginationCriteria : initializePaginationCriteria(),
        totalFilteredRecords: 0,
        totalRecords: 0,
        recordsPerPage : typedQuotesService.getRecordsPerPage(),
        getStartIndex : function(){
          return $scope.paginationCriteria.displayStart + 1;
        },
        getEndIndex : function(){
          var endIndex = $scope.paginationCriteria.displayStart + $scope.recordsPerPage;
          if(endIndex > $scope.totalFilteredRecords){
            endIndex = $scope.totalFilteredRecords;
          }
          return endIndex;
        },
        getTotalIndex : function(){
          return $scope.totalFilteredRecords;
        },
        showPagination : function(){
          return $scope.recordsPerPage < $scope.totalFilteredRecords;
        },
        applyFilter : function(){
          $rootScope.$broadcast("eventApplyFilter");
          resetPaginationCriteria();
          updateScopeWithData(typedQuotesService.filter($scope.filterCriteria));
        },
        resetFilter : function(){
          $rootScope.$broadcast("eventResetFilter");
          resetPaginationCriteria();
          updateScopeWithData(typedQuotesService.reset($scope.filterCriteria));
        },
        applySorting : function(sortColumn, sortOrder){
          $rootScope.$broadcast("eventApplySorting");
          angular.extend($scope.sortCriteria, {
            sortColumn: sortColumn,
            sortOrder : sortOrder
          });
          resetPaginationCriteria();
          updateScopeWithData(typedQuotesService.sort($scope.sortCriteria));
        },
        applyPagination: function(){
          $scope.paginationCriteria.displayStart = ($scope.paginationCriteria.currentPage - 1) * $scope.recordsPerPage;  
          updateScopeWithData(typedQuotesService.paginate($scope.paginationCriteria));
        }
      });

var resetPaginationCriteria = function(){
  $scope.paginationCriteria.displayStart = 0;
  $scope.paginationCriteria.currentPage = 1;
};

var updateScopeWithData = function(promise){
  $rootScope.$broadcast("quotesLoadingStart");
  promise.then(
    function(data){
     angular.extend($scope,{
      plans : data.plans,
      totalFilteredRecords : data.totalFilteredRecords,
      totalRecords : data.totalRecords
    });
   },
   function(){
    $log.log("in error");
  })
  ["finally"](function(){
   $rootScope.$broadcast("quotesLoadingEnd");
 });
};

var updateScopeWithInitialData = function(data){
  angular.extend($scope, data);
};

var getInitialData = function(){
  return typedQuotesService.getInitialData($scope.filterCriteria, $scope.sortCriteria, $scope.paginationCriteria);
};
this.updateScopeWithInitialData = updateScopeWithInitialData;
this.getInitialData = getInitialData;
}],
link : function(scope, element, attrs, hcQuotesController){

        //There might be initial filter, sort and pagination criteria
        $rootScope.$broadcast("quotesLoadingStart");
        hcQuotesController.getInitialData().then(function(data){
          hcQuotesController.updateScopeWithInitialData(data);
        },
        function(){
          $log.log("in error");
        })
        ["finally"](function(){
          $compile(element.contents())(scope);
          $rootScope.$broadcast("quotesLoadingEnd");
        });
      }
    };
  }]);
'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.quotes
 * @description
 * # quotes
 * Provider in the hcUiApp.
 */
angular.module('hcUiApp')
  .provider('quotes', function () {

    // Private variables
    var type = 'client';

    // Private constructor
    function ClientQuotes() {
      this.getQuotes = function(){

      }
      this.filterQuotes = function(filterCriteria){
                
      }
    }

    function ServerQuotes(){
      this.getQuotes = function(){

      }
      this.filterQuotes = function(filterCriteria){

      }
    }

    // Public API for configuration
    this.setType = function (type) {
      type = type;
    };

    // Method for instantiating
    this.$get = function () {
      if(type === 'server'){
        return new ServerQuotes();  
      }
      else{
        return new ClientQuotes();
      }
      
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name hcUiApp.controller:QuotesCtrl
 * @description
 * # QuotesCtrl
 * Controller of the hcUiApp
 */
angular.module('hcUiApp')
  .controller('QuotesCtrl', function ($scope) {
    function Filter(){
    	//This has to implemented by ay new filter
    	this.applyFilter = function(value){

    	}
    }

    
  });

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.quotesFilter
 * @description
 * # quotesFilter
 * Factory in the hcUiApp.
 */
 angular.module('hcUiApp')
 .factory('quotesFilter', function () {

    //Generic filter class
    function Filter(){
      this.applyFilter = function(value){
        return true;
      }
      this.criteria = null;
      this.initialCriteria = null;
    }

    function RangeFilter(criteria){
      this.criteria =  criteria || [null,null];
      this.initialCriteria = angular.copy(criteria);
    }

    RangeFilter.prototype.applyFilter = function(value){
      var min = this.criteria[0],
      max = this.criteria[1];
      return value >= min && value <= max;
    };

    RangeFilter.prototype.reset = function(){
        this.criteria = angular.copy(this.initialCriteria);
    };

    RangeFilter.prototype.getSearchParams = function(prefix){
      var params = {};
      params[prefix+"_min"] = this.criteria[0];
      params[prefix+"_max"] = this.criteria[1];
      return params;
    };

    function LikeFilter(criteria){
      this.criteria = criteria || null;
      this.initialCriteria = angular.copy(criteria);
    }

    LikeFilter.prototype.applyFilter = function(value){
      return value.indexOf(this.criteria) != -1;
    }

    LikeFilter.prototype.reset = function(){
        this.criteria = angular.copy(this.initialCriteria);
    };

    LikeFilter.prototype.getSearchParams = function(prefix){
      var params = {};
      params[prefix] = this.criteria;
      return params;
    }


    function EqualFilter(criteria){
      this.criteria = criteria || null;
      this.initialCriteria = angular.copy(criteria);
    }

    EqualFilter.prototype.applyFilter = function(value){
      return _.isEqual(this.criteria, value);
    }

    EqualFilter.prototype.reset = function(){
        this.criteria = angular.copy(this.initialCriteria);
    };

    EqualFilter.prototype.getSearchParams = function(prefix){
      var params = {};
      params[prefix] = this.criteria;
      return params;
    }

    function InFilter(criteria){
      this.criteria = criteria || [];
      this.initialCriteria = angular.copy(criteria);
    }

    InFilter.prototype.applyFilter = function(value){
        return this.criteria.length === 0 || this.criteria.indexOf(value) != -1;
    }

    InFilter.prototype.reset = function(){
        this.criteria = angular.copy(this.initialCriteria);
    };

    InFilter.prototype.getSearchParams = function(prefix){
      var params = {};
      params[prefix] = this.criteria.join();
      return params;
    }

    // Public API here
    return {
      createRangeFilter: function (criteria) {
        return new RangeFilter(criteria);
      },
      createEqualFilter: function(criteria){
        return new EqualFilter(criteria);
      },
      createLikeFilter : function(criteria){
        return new LikeFilter(criteria);
      },
      createInFilter : function(criteria){
        return new InFilter(criteria);
      },
      isRangeFilter: function(filter){
        return filter instanceof RangeFilter;
      },
      isInFilter: function(filter){
        return filter instanceof InFilter;
      },
      filterQuotes : function(quotes){
        var filteredQuotes = [];
        quotes.forEach(function(quote, index){
          if(_filter(quote)){
            filteredQuotes.push(quote);
          }
        });
        return filteredQuotes;
      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcSlider
 * @description
 * #Overview
 * 'hcSlider' directive provides a slider with two handles that can be 
 * moved with the mouse or by using the arrow keys. We can set the minimum and maximum value for the slider.
 *
 * @requires hcUiApp.templateURL
 * @requires ngModel
 * @restrict AE
 * 
 * @scope
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
     	<hc-slider slider-min="10" slider-max="100" ng-model="sliderVal" type="currency">
     	</hc-slider>
        <br/><br/>Click on button for default range: <button class="btn btn-primary" ng-click="sliderVal=[20,55]">Default Range</button>

     	<br/>Range: {{sliderVal}}
     	<script type="text/ng-template" id="/views/hc-slider.html">
          	<div class="customSlider" ui-slider="sliderOptions" min="{{min}}" max="{{max}}" ng-model="slider"></div>
          	<div class="sliderData">
          		<span class="pull-left minRange">
          			{{slider[0] | triggerFilter:type}}
          		</span>
          		<span class="pull-right maxRange">
          			{{slider[1] | triggerFilter:type}}
          		</span>
          	</div>
      	</script>
     </file>
   </example>


 */
angular.module('hcUiApp')
  .directive('hcSlider', ["templateURL", "utils",function (templateURL,utils) {
    return {
    restrict: "AE",
    compile : function(){
      return {
        pre : function(scope, element, attrs, ngModelCtrl){
          scope.sliderOptions = {
            "change" : updateModel,
            "range" : true
          };

          scope.step = scope.sliderStep || 1;
          
          scope.$watchGroup(['sliderMax','min'], function(sliderRangeArr){
                var maxValue = sliderRangeArr[0],
                minValue=sliderRangeArr[1],
                stepValue=scope.step;
                scope.max=utils.updateMaxValue(minValue,maxValue,stepValue);                
          });
          
          function updateModel(){
            ngModelCtrl.$setViewValue(scope.slider);
          }
        },
        post : function(scope, element, attrs, ngModelCtrl){
             // console.log(' post scope.step',scope.sliderStep);
            ngModelCtrl.$render = function(){
              scope.slider = ngModelCtrl.$viewValue;
            };
          }
      };
    },
    templateUrl : templateURL.getUrl("hc-slider"),
    require : "ngModel",
    scope : {
      sliderMax : "=",
      min : "=sliderMin",
      type: "@",
      sliderStep: "=sliderStep"
     
    }
  };
}]);


'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.templateURL
 * @description
 * # templateURL
 * Provider in the hcUiApp.
 */
angular.module('hcUiApp')
  .provider('templateURL', function () {

    // Private variables
    var url = '/views/{directive}.html';

    // Private constructor
    function TemplateUrl() {
      this.getUrl = function (directive) {

        return url.replace("{directive}",directive);
      };
    }

    // Public API for configuration
    this.setUrl = function (u) {
      url = u;
    };

    // Method for instantiating
    this.$get = function () {
      return new TemplateUrl();
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcSliderFilter
 * @description
 * # hcSliderFilter
 */
angular.module('hcUiApp')
  .directive('hcSliderFilter', ["templateURL","quotesFilter","utils" ,function (templateURL, quotesFilter,utils){
    return {
      template: "<hc-slider></hc-slider>",
      restrict: 'E',
      controller : ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
      	var predicate = $attrs.predicate,
      	filterCriteria = $scope.filterCriteria,
        criteria = null;
        if(filterCriteria[predicate]){
          criteria = filterCriteria[predicate].criteria;
        }
        else{
          var min=$scope.$eval($attrs.sliderMin),
          max=$scope.$eval($attrs.sliderMax),
          step=$scope.$eval($attrs.sliderStep);
          criteria = [min,utils.updateMaxValue(min,max,step)];
        }
      	var rangeFilter = quotesFilter.createRangeFilter(criteria);
      	filterCriteria[predicate] = rangeFilter;
      }],
      compile : function(element, attrs){
      	element.find("hc-slider")
  		.attr("ng-model","filterCriteria['"+attrs.predicate+"'].criteria")
  		.attr("slider-max", attrs.sliderMax)
  		.attr("slider-min", attrs.sliderMin)
      .attr("type", attrs.type)
      .attr("slider-step",attrs.sliderStep);
     	}
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcCheckboxFilter
 * @description
 * # hcCheckboxFilter
 */
angular.module('hcUiApp')
  .directive('hcCheckboxFilter', ["quotesFilter",function (quotesFilter) {
    return {
      template: "<hc-checkbox-group type='horizontal' show-all='false'></hc-checkbox-group>",
      restrict: 'E',
      controller : ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
      	var predicate = $attrs.predicate,
      	filterCriteria = $scope.filterCriteria,
        criteria = null;
        if(filterCriteria[predicate]){
          criteria = filterCriteria.criteria;
        }
        else{
          criteria = $scope.$eval($attrs.items);
        }
      	var inFilter = quotesFilter.createInFilter(criteria);
      	filterCriteria[predicate] = inFilter;
      }],
      compile : function(element, attrs){
      	var $hcCheckboxGroup = element.find("hc-checkbox-group");
      	$hcCheckboxGroup
      	.attr("items", attrs.items)
      	.attr("ng-model","filterCriteria['"+attrs.predicate+"'].criteria")
      	.attr("show-all",false)
        .attr("id", attrs.id);
      }
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.quotesSort
 * @description
 * # quotesSort
 * Factory in the hcUiApp.
 */
angular.module('hcUiApp')
  .factory('quotesSort', ["$filter",function ($filter) {

    var sortCriteria = null;

    function SortCriteria(predicate, reverse){
      this.predicate = predicate;
      this.reverse = reverse;
    }
    return {
      createSortCriteria: function (predicate, reverse) {
        return new SortCriteria(predicate, reverse);
      },
      setSortCriteria: function(predicate, order){
        sortCriteria = sortCriteria || new SortCriteria();
        sortCriteria.predicate = predicate;
        sortCriteria.reverse = (order === 'asc')?false:true;
      },
      getSortCriteria: function(){
        return sortCriteria;
      },
      sort : function(quotes){
        if(sortCriteria){
          return $filter("orderBy")(quotes,sortCriteria.predicate, sortCriteria.reverse);
        }
        return quotes;
      }

    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcSsn
 * @description
 * #Overview
 * 'hcSsn' directive provides three different input boxes to fill the user's three parts of the
 * Social Security Number respectively in these input boxes.
 *
 * @requires hcUiApp.templateURL
 * @requires ngModel
 * @requires hcUiApp.directive:hcSsn
 * @restrict E
 * 
 * @scope
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <hc-ssn name="employee.ssn" ng-model="employee.ssn" ng-required="true" value="123122345" hc-initial="true" id="employeeSSN"></hc-ssn>
        <span class="inlineError" ng-show="employeeForm['employee.ssn'].$error.required"><s:message code="NotBlank.employeeDetail.employee.ssn"/></span>

        {{employee.ssn}}
        
        <script type="text/ng-template" id="/views/hc-ssn.html">
            <div>
                <div class="col-md-4 col-sm-4 gutter0">
                   <label for="{{id}}_1" class="sr-only">SSN1</label>
                   <input type="password" class="form-control" id="{{id}}_1" name="{{name}}_1" ng-model="ssnCollection[0]" maxlength="3" hc-numeric="true" ng-minlength="3" ng-maxlength="3" ng-disabled="disabled">
                </div>
                <div class="col-md-3 col-sm-3 gutterL10 gutterR0">
                   <label for="{{id}}_2" class="sr-only">SSN2</label>
                   <input type="password" class="form-control" id="{{id}}_2" hc-focus-on="ssnCollection[0].length == 3" name="{{name}}_2" ng-model="ssnCollection[1]" maxlength="2" hc-numeric="true" ng-minlength="2" ng-maxlength="2" ng-disabled="disabled">
                </div>
                <div class="col-md-5 col-sm-5 gutterL10 gutterR0">
                   <label for="{{id}}_3" class="sr-only">SSN3</label>
                   <input type="text" class="form-control" hc-focus-on="ssnCollection[1].length == 2" id="{{id}}_3" name="{{name}}_3" maxlength="4" ng-model="ssnCollection[2]" hc-numeric="true" ng-minlength="4" ng-maxlength="4" ng-disabled="disabled">
                </div>
                <input type="hidden" name="{{name}}" ng-disabled="disabled" value="{{ssn}}">
            </div>
        </script>
     </file>
   </example>


 */
angular.module('hcUiApp')
  .directive("hcSsn", ["templateURL", function(templateURL){
     return {
        restrict: "E",
        templateUrl : templateURL.getUrl("hc-ssn"),
        require: ["ngModel","hcSsn"],
        scope: {
            name : "@",
            id: "@",
            disabled: "=ngDisabled",
            readonly: "=ngReadonly"
        },
        controller : ["$scope",function($scope){
            this.getSSNCollection = function(ssn){
                 if(ssn){
                      var viewValueArr =[];
                	 viewValueArr[0] = ssn.substring(0, 3);
                	 viewValueArr[1] = ssn.substring(3, 5);
                	 viewValueArr[2] = ssn.substring(5, 9);
                     return viewValueArr;
                 }
                 return [];
            };
            this.getSSN = function(ssnCollection){
                 if(ssnCollection.length == 3 && ssnCollection[0] && ssnCollection[1] && ssnCollection[2]){
                     return ssnCollection[0]  + ssnCollection[1]  + ssnCollection[2];
                 }
                 else{
                    return undefined;
                 }
            };
        }],
        compile: function(){
            return {
                pre: function(scope, element, attrs, ctrls){
                    var ngModelCtrl = ctrls[0],
                    hcSsnCtrl = ctrls[1];
                    ngModelCtrl.$render = function(){
                        scope.ssnCollection = hcSsnCtrl.getSSNCollection(ngModelCtrl.$viewValue);
                    }
                    scope.$watchCollection('ssnCollection', function(newValue){
                        scope.ssn = hcSsnCtrl.getSSN(newValue);
                    });
                    scope.$watch("ssn", function(ssn){
                        ngModelCtrl.$setViewValue(ssn);
                    });
                }
            }
        }
    }
}]);
'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:hcQuotesProcessor
 * @function
 * @description
 * # hcQuotesProcessor
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
  .filter('hcQuotesProcessor', ["quotesFilter","quotesSort","quotesPaginate", function (quotesFilter, quotesSort, quotesPaginate) {
    return function (quotes) {
    	var filteredQuotes = [];
    	//apply filter
    	filteredQuotes = quotesFilter.filterQuotes(quotes);
    	
    	//sort quotes now
    	filteredQuotes = quotesSort.sort(filteredQuotes);

    	console.log(filteredQuotes.length);
    	//quotesPaginate.setCurrentPage(1);
      	return filteredQuotes;
    };
  }]);

'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:hcSortQuotes
 * @function
 * @description
 * # hcSortQuotes
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
  .filter('hcSortQuotes', ["$filter","quotesSort",function ($filter, quotesSort) {
    return function (quotes) {
    	var sortCriteria = quotesSort.getSortCriteria();
    	if(sortCriteria){
    		return $filter("orderBy")(quotes,sortCriteria.predicate, sortCriteria.reverse);
    	}
    	return quotes;
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcQuotesPagination
 * @description
 * # hcQuotesPagination
 */
angular.module('hcUiApp')
  .directive('hcQuotesPagination',["quotesPaginate",function (quotesPaginate) {
    return {
      template: '<pagination></pagination>',
      restrict: 'E',
      scope: {
      	itemsPerPage : "=",
      	totalItems: "="
      },
      controller : ["$scope","$element","$attrs", function($scope, $element, $attrs){
      	quotesPaginate.setRecordsPerPage($scope.itemsPerPage);
      	$scope.currentPage = 1;
      	$scope.$watch("currentPage", function(newValue){
      		quotesPaginate.setCurrentPage(newValue);
      	});
      }],
      compile : function(element, attrs){
      	element.find("pagination")
      	.attr("ng-model","currentPage")
      	.attr("items-per-page","itemsPerPage")
      	.attr("total-items","totalItems");
      }
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.quotesPaginate
 * @description
 * # quotesPaginate
 * Factory in the hcUiApp.
 */
angular.module('hcUiApp')
  .factory('quotesPaginate', function () {
    var recordsPerPage = 10;

    var currentPage = 1;

    // Public API here
    return {
      setRecordsPerPage : function(num){
        recordsPerPage = num;
      },
      setCurrentPage : function(num){
        currentPage = num;
      },
      paginate: function (quotes) {
        if(quotes.length > recordsPerPage){
          var startIndex = (currentPage-1)*recordsPerPage,
          endIndex = startIndex + recordsPerPage;
          return quotes.slice(startIndex, endIndex); 
        }
        return quotes;
      }
    };
  });

'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:hcPagination
 * @function
 * @description
 * # hcPagination
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
  .filter('hcPagination', ["quotesPaginate", function (quotesPaginate) {
    return function (quotes) {
    	console.log("quotes.length",quotes.length);
    	var paginatedQuotes = quotesPaginate.paginate(quotes);
    	console.log("paginatedQuotes.length",paginatedQuotes.length);
    	return paginatedQuotes;
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.quotesService
 * @description
 * # quotesService
 * Provider in the hcUiApp.
 */
angular.module('hcUiApp')
  .provider('quotesService', function () {

    var productCategoryMap = {},
    recordsPerPage = 5,
    $http, $q, $filter, quotesFilterService;

    this.setRecordsPerPage = function(recordsPerPg){
      recordsPerPage = recordsPerPg;
    }

    this.setProductCategoryQuotesUrls = function(productCategoryQuotesUrls){
      _.each(productCategoryQuotesUrls, function(url, productCategory){
        productCategoryMap[productCategory] = new QuotesService(url);
      });
    }

    // Private constructor
    function QuotesService(url) {
      this.url = url;
      this.filterCriteria = {};
      this.sortCriteria = {};
      this.paginationCriteria = {
          displayLength: recordsPerPage
      };
    }

    angular.extend(QuotesService.prototype, {
      getData : function(){
        var that = this;
        var deferred = $q.defer();
        $http.get(this.url,{
          params : this.getParams()
        })
        .success(function(data){
          deferred.resolve(data);
        })
        .error(function(data){
          deferred.reject(data);
        });
        return deferred.promise;
      },
      getInitialData : function(filterCriteria, sortCriteria, paginationCriteria){
        this.filterCriteria = filterCriteria;
        this.sortCriteria = sortCriteria;
        this.paginationCriteria.displayStart = paginationCriteria.displayStart;
        return this.getData();
      },
      getParams : function(){
        var filterParams = this.getFilterCriteriaParams(),
        sortCriteriaParams = this.getSortCriteriaParams(),
        paginationCriteriaParams = this.getPaginationCriteriaParams();
        return _.extend({"paginate-result":true},filterParams,sortCriteriaParams, paginationCriteriaParams);
      },
      filter : function(filterCriteria){
        this.filterCriteria = filterCriteria;
        this.resetPagination();
        return this.getData();
      },
      reset : function(filterCriteria){
          _.each(filterCriteria, function(criteria, key){
            criteria.reset();
          });
          this.resetPagination();
          return this.getData();
      },
      sort : function(sortCriteria){
        this.sortCriteria = sortCriteria;
        this.resetPagination();
        return this.getData();
      },
      paginate : function (paginationCriteria) {
      this.paginationCriteria.displayStart = paginationCriteria.displayStart;
        return this.getData();
      },
      getRecordsPerPage : function(){
        return recordsPerPage;
      },
      getFilterCriteriaParams : function(){
        var params = {};
        _.each(this.filterCriteria, function(criteria, key){
          angular.extend(params, criteria.getSearchParams(key));
        });
        return params;
      },
      getSortCriteriaParams : function(){
        return this.sortCriteria;
      },
      getPaginationCriteriaParams : function(){
        return this.paginationCriteria;
      },
      resetPagination : function(){
        this.paginationCriteria.displayStart = 0;
      }
    });

    this.$get = ["$http", "$q","$filter","quotesFilter", function(http, q, filter, quotesFilterService){
      $http = http;
      $q = q;
      $filter = filter;
      quotesFilterService = quotesFilterService;
      return {
        getService: function(type){
          return productCategoryMap[type];
        }
      }
    }];

  });
'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcMask
 * @description
 * #Overview
 * 'hcMask' directive is used for masking.
 * Here we are using this directive for 4 types of data inputs
 * i.e. date of birth, zip, SSN and phone no.
 *
 * @requires ngModel
 * @scope
 *
 * @element input type="text"
 *
 * @example
    <example module="hcUiApp">
     <file name="index.html">
        <form name="dummyForm">
            Date of birth: <input type="text" name="dobInput" hc-mask="dob" id="dobInput" ng-model="model.dob" /><br/>
            Zip: <input type="text" name="zipInput" hc-mask="zip" id="zipInput" ng-model="model.zip" /><br/>
            SSN: <input type="text" name="ssnInput" hc-mask="ssn" id="ssnInput" ng-model="model.ssn" /><br/>
            Phone No.: <input type="text" name="phoneInput" hc-mask="phone" id="phoneInput" ng-model="model.phone" /><br/>
        </form>
        Validity: {{dummyForm.$valid}}
     </file>
    </example>
 */
angular.module('hcUiApp')
  .directive('hcMask', [ function() {
	return {
		require : 'ngModel',
		scope : {
			type : "@hcMask"
		},
		controller : ["$scope",function($scope) {
			//Masking types are defined here. This will be shared across the application. To create a new masking,
			//add it as a property of scope here. Since this is isolated scope, it will not mess with parent scope.
			$scope.dob = "99/99/9999";
			$scope.zip = "99999";
			$scope.ssn = "999-99-9999";
			$scope.phone = "999-999-9999";
		}],
		link : function($scope, element, attrs, ngModelCtrl) {

			var $element = $(element[0]);
			$element.mask($scope.$eval($scope.type));
			/* Add a parser that extracts the masked value into the model but only if the mask is valid
			 */
			ngModelCtrl.$parsers.push(function(value) {
				var isValid = value.length && value.indexOf("_") == -1;
				return isValid ? value : undefined;
			});
			/* When keyup, update the view value. I am not 100% percent convinced on this.
			Asked a question on (stack overflow)[http://stackoverflow.com/questions/26310408/integrate-jquery-masked-input-as-angularjs-directive]
			 */
			element.bind('keyup', function() {
				$scope.$apply(function() {
					ngModelCtrl.$setViewValue(element.val());
				});
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcFileUpload
 * @description
 * #Overview
 * 'hcFileUpload' directive is used to upload the files.
 *
 * @retrict E
 * @requires hcUiApp.templateURL
 *
 * @templateURL /views/hc-file-upload.html
 * 
 * @scope
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <hc-file-upload name="fileUpload" id="fileUploadDirective" action=""></hc-file-upload>

        <script type="text/ng-template" id="/views/hc-file-upload.html">
            <form id="fileupload_{{id}}" action="{{action}}" method="POST"
                enctype="multipart/form-data" data-ng-controller="FileUploadController"
                data-file-upload="options">
                <span class="" ng-class="{disabled: disabled}"> <i
                    class="glyphicon glyphicon-plus"></i> <span>Browse</span> <input
                    type="file" name="{{name}}" ng-disabled="disabled">
                </span>
                <div class="clearfix">
                    <p>File selected:</p>
                    <div data-ng-repeat="file in queue"
                        data-ng-class="{'processing': file.$processing()}"
                        <div ng-hide="file.hide" class="attachedFileBlock col-md-8 offsetB20">
                          <span ng-hide="file.hide">
                                <span class="pull-left">{{file.name}}</span>
                                <strong class="error text-danger">{{file.error}}</strong>
                                <button type="button" class="close" 
                                    data-ng-click="file.hide = !file.hide">
                                    <span aria-hidden="true">&times;</span><span class="sr-only">Close</span>
                                </button>
                        </span>
                    </div></div>
                </div>
            </form>
        </script>
     </file>
    </example>
 */
angular.module('hcUiApp')
 .directive('hcFileUpload', ["templateURL",function(templateURL) {
    return {
        restrict: "E",
        templateUrl: templateURL.getUrl("hc-file-upload"),
        scope: {
            name : "@",
            id: "@",
            action: "@"
        },
        controller : function($scope, $element, $attrs){
        	
        }
    };
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcDate
 * @description
 * #Overview
 * 'hc-date' directive provides three selection inputs for months, days, and years values.
 * User will get a drop-down list and can select one option for each of the values to get a required date.
 * 
 * @retrict E
 * @requires hcUiApp.templateURL
 * @requires ngModel
 *
 * @templateURL /views/hc-date.html
 * 
 * @scope
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <hc-date name="date" id="date" ng-model="dateCollection" ng-disabeled="disabled"></hc-date>
        {{dateCollection}}
        <script type="text/ng-template" id="/views/hc-date.html">
            <div>
              <div class="col-md-4 col-sm-4 gutter0">
                <label for="{{id}}_month" class="sr-only">Month</label>
                <select class="form-control" id="{{id}}_month" ng-model="dateCollection.month" ng-disabled="disabled">
                  <option value="">MM</option>
                  <option value="01">JAN</option>
                  <option value="02">FEB</option>
                  <option value="03">MARCH</option>
                  <option value="04">APRIL</option>
                  <option value="05">MAY</option>
                  <option value="06">JUNE</option>
                  <option value="07">JULY</option>
                  <option value="08">AUGUST</option>
                  <option value="09">SEPTEMBER</option>
                  <option value="10">OCTOBER</option>
                  <option value="11">NOVEMBER</option>
                  <option value="12">DECEMBER</option>
                </select>
              </div>
              <div class="col-md-4 col-sm-4 gutterL10 gutterR0">
                <label for="{{id}}_day" class="sr-only">Day</label>
                <select class="form-control" id="{{id}}_day" ng-model="dateCollection.day" ng-options = "n for n in days" ng-disabled="disabled">
                  <option value="">DD</option>
                </select>
              </div>
              <div class="col-md-4 col-sm-4 gutterL10 gutterR0">
                <label for="{{id}}_year" class="sr-only">Year</label>
                <select class="form-control" id="{{id}}_year" ng-model="dateCollection.year" ng-options = "n for n in years" ng-disabled="disabled">
                  <option value="">YYYY</option>
                </select>
              </div>
              <input type="hidden" name="{{name}}" value="{{date}}" ng-disabled="disabled">
            </div>
        </script>
     </file>
    </example>
 */
angular.module('hcUiApp')
  .directive('hcDate', ["templateURL", function(templateURL) {
    return {
        restrict: "E",
        templateUrl: templateURL.getUrl("hc-date"),
        require: "ngModel",
        scope: {
            name : "@",
            id: "@",
            disabled : "=ngDisabled"
        },
        priority: 1,
        controller : ["$scope",function($scope){
            $scope.dateCollection = {};
            //If any of month, day, year changes change the hidden date field
            $scope.$watchCollection('dateCollection', function(newValue){
                if(newValue.month && newValue.day && newValue.year){
                    $scope.date = newValue.month + "/" + newValue.day + "/" + newValue.year;
                }
                else{
                    $scope.date = undefined;
                }
            });

            function getDays(){
                var days =[];
                for(var i = 1; i < 32; i++){
                    if(i < 10){
                        days.push("0"+i);
                    }
                    else{
                        //Converting the value to string
                        days.push(""+i);
                    }
                }
                return days;
            }

            function getYears(){
                var years = [],
                currentYear = new Date().getFullYear();
                for(var i = 0; i < 100 ; i++){
                    years.push(currentYear - i + "");
                }
                return years;
            }
           
            $scope.days = getDays();
            $scope.years = getYears();

        }],
        compile : function(){
            return {
                pre: function(scope, element, attrs, ngModelCtrl){
                     //Assumption is the format has to be MM/DD/YYYY
                    ngModelCtrl.$render = function(){
                        var viewValue = ngModelCtrl.$viewValue;
                        if(viewValue){
                            var viewDateStr = viewValue.split("/");
                            if(viewDateStr.length == 3){
                                var month = viewDateStr[0],
                                year = viewDateStr[2],
                                day = viewDateStr[1];
                                scope.dateCollection.month = month;
                                scope.dateCollection.day = day;
                                scope.dateCollection.year = year;
                            }
                        }
                    }
                    scope.$watch('date', function(newDate){
                        ngModelCtrl.$setViewValue(newDate);
                    });
                    
                }
            }
        }
    }
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcDatePicker
 * @description
 * # Overview
 * 'hc-date-picker' is tied to a standard form input field. Focus on the input (click, or use the tab key) to open an interactive calendar in a small overlay. 
 * Choose a date, click elsewhere on the page (blur the input), or hit the Esc key to close. If a date is chosen, feedback is shown as the input's value.
 * 
 * @restrict A
 * @requires ngModel
 * @scope
 *
 * @element input type="text"
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
	     <div ng-controller="DemoController">
	        <form name="dummyForm">
	        	Date: <input type = "text" hc-date-picker="true" name="date" ng-model="date" options ="options">
	        </form>
	     </div>  
     </file>

     <file name="script.js">

        angular.module('hcUiApp')
        .controller("DemoController", function($scope){
        	$scope.options = {minDate :new Date()} 
			
        });

     </file>
    </example>
 */
angular.module('hcUiApp').directive('hcDatePicker', function() {
	return {
		restrict : 'A',
		require : 'ngModel',
		scope : {
			options : "=options"
		},
		link : function(scope, element, attrs, ngModelCtrl) {
			var mandatoryOptions={
					changeYear : true,
					changeMonth : true,
					onSelect: function (dateText) {
				          updateModel(dateText);
					}};
			
			
			var updateModel = function (dateText) {
			       ngModelCtrl.$setViewValue(dateText);
			};
			element.datepicker(scope.options);
			scope.$watchCollection("options", function (newValue, oldValue) {
				var options = angular.extend(angular.extend({}, newValue), mandatoryOptions);
				element.datepicker("option", options);
	         });
			ngModelCtrl.$render = function(){
				element.datepicker( "setDate", ngModelCtrl.$viewValue );
			};
		}
	};
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcCustomInput
 * @description
 * # hcCustomInput
 */
angular.module('hcUiApp')
  .directive("hcCustomInput", function(){
	return {
		restrict : "CA",
		require: "ngModel",
		link : function(scope, element, attrs){
			scope.$watch(attrs.ngModel, function(){
				var $labelParent = element.parent("label");
				if(element.is(":checked")){
					$labelParent.addClass('active');
				}
				else{
					$labelParent.removeClass('active');
				}
				
			});
		}
	};
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:zipWidget
 * @description
 * # zipWidget
 */
angular.module('hcUiApp')
  .directive("zipWidget", ["demographicService", "$q", "templateURL", function(demographicService, $q, templateURL){
	return {
		require: ["ngModel","^form"],
		templateUrl : templateURL.getUrl("zip-widget"),
		scope: {
			address: "=ngModel",
			zip: "@",
			county: "@",
			state: "@",
			name: "@",
			id: "@",
			required: "@ngRequired",
			disabled : "=ngDisabled"
		},
		restrict: "E",
		controller : ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
			var namePrefix = ($scope.name) ? $scope.name + "." : "";
			$scope.zipName = namePrefix + "zip";
			$scope.countyName = namePrefix + "county";
			$scope.stateName = namePrefix + "state";		
			$scope.address = $scope.address || {};
			$scope.required = $scope.required || false;
			$scope.countyList = [];
		}],
		link : function($scope, element, attrs, controllers){
			var ngModelController = controllers[0],
			ngFormController = controllers[1],
			demographicData = null;
			$scope.isRequiredZip = function(){
				return ngFormController[$scope.zipName].$error.required && ngFormController[$scope.zipName].$dirty;
			}
			$scope.isRequiredCounty = function(){
				return ngFormController[$scope.countyName].$error.required && ngFormController[$scope.countyName].$dirty;
			}
			$scope.isInvalidZip = function(){
				return ngModelController.$error.zip && ngFormController[$scope.zipName].$dirty;
			}
			$scope.$watch("zip", function(newZip, oldZip){
				if(newZip){
					//fetch data from demographicService
					var demographicDataPromise = demographicService.getDemographicData(newZip);
					demographicDataPromise.then(function(data){
						demographicData = data;
						var countyList = demographicService.getCountiesForZipInDemographicData(newZip, demographicData);
						$scope.countyList.length = 0;
						Array.prototype.push.apply($scope.countyList, countyList);
						ngModelController.$setValidity("zip",true);
					},
					function(){
						demographicData = null;
						$scope.countyList.length = 0;
						ngModelController.$setValidity("zip",false);
						$scope.invalidZip = true;
					});
				}
				else{
					ngModelController.$setValidity("zip",true);
					demographicData = null;
					$scope.countyList.length = 0;
				}
				$scope.address.zip = newZip;
			});
			$scope.$watchCollection("countyList", function(newCountyList, oldCountyList){
				if(! _.isEqual(newCountyList, oldCountyList)){
					if(newCountyList.length){
						if(newCountyList.length == 1){
							$scope.county = newCountyList[0];
						}
						var countyIndex = $.inArray($scope.county, newCountyList);
						if(countyIndex == -1){
							$scope.county = null;
						}
					}
					else{
						$scope.county = null;
					}
				}
			});
			$scope.$watch("county", function(newCounty, oldCounty){
				if(newCounty && demographicData){
					$scope.state = demographicService.getStateForCountyInDemographicData(newCounty, demographicData);
				}
				else if(!newCounty){
					$scope.state = null;
				}
				$scope.address.county = newCounty;
			});
			$scope.$watch("state", function(newState, oldState){
				$scope.address.state = newState;
			});
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcFocusOn
 * @description
 * #Overview
 * 'hcFocusOn' directive is used to give focus to an element, if it can be focused.
 *
 * @requires $timeout
 * @requires $parse
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <form name="dummyForm">
            Name: <input type="text" name="firstValue" id="firstInput" hc-focus-on="true" ng-model="model.input1" >{{model.input1}}</br>
            Age:  <input type="text" name="secondValue"  id="secondInput" ng-model="model.input2" >{{model.input2}}
        </form>
     </file>
    </example>
 */
angular.module('hcUiApp')
  .directive("hcFocusOn", ["$timeout","$parse", function($timeout, $parse){
    return {
        link : function(scope, element, attrs) {
             var model = $parse(attrs.hcFocusOn);
              scope.$watch(model, function(value) {
                if(value === true) { 
                  $timeout(function() {
                    element[0].focus(); 
                  });
                }
              });
            }
    };
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcNumeric
 * @description
 * #Overview
 * 'hcNumeric' directive is used to force user to enter only numeric data in an input field.
 *
 * @requires ngModel
 *
 * @element input type="text"
 *
 * @example
 	<example module="hcUiApp">
     <file name="index.html">
     	<form name="dummyForm">
     		<label>Only numeric data: </label>
     		<input type="text" hc-numeric="true" id="numericInput" ng-model="model.input" />
     		<br/>{{model.input}}
     	</form>
        <br>Is entered data only numeric? : {{dummyForm.$valid}}
     </file>
    </example>
 		

 */
angular.module('hcUiApp')
  .directive("hcNumeric", function(){
    var linker = function(scope, element, attrs){
        element.numeric();
    }
    return {
        require: "ngModel",
        link : linker
    }
});
'use strict';

/**
 * @ngdoc function
 * @name hcUiApp.controller:ModalopenCtrl
 * @description
 * # ModalopenCtrl
 * Controller of the hcUiApp
 */
angular.module('hcUiApp')
  .controller('ModalopenCtrl', ["$scope", "$modal", function ($scope, $modal) {
   $scope.openBasicModal = function(templateUrl, controller, resolveParams) {
	   var modalOptions = {
				templateUrl : templateUrl,
				controller : controller
		};
	   
	   if(resolveParams){
		   var resolve = {};
		   _.each(resolveParams, function(value, key){
			   resolve[key] = function(){
				   return value;
			   };
		   }); 
		   if(! _.isEmpty(resolve))
			   modalOptions.resolve = resolve;
	   }
	  
	   
	   var modalInstance = $modal.open(modalOptions);
	};
  }]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.demographicService
 * @description
 * # demographicService
 * Provider in the hcUiApp.
 */
angular.module('hcUiApp')
  .provider('demographicService', function () {

    // Private variables
    var demographicUrl = null,
    $http, $q;

    // Private constructor
    function DemographicService() {

    }

    DemographicService.prototype.getDemographicData = function(zip){
      var deferred = $q.defer(),
      url = demographicUrl+zip;
      $http.get(url)
      .success(function(data){
        if(data){
          deferred.resolve(data);
        }
        else{
          deferred.reject("Invalid zip");
        }
        
      })
      .error(function(){
        deferred.reject("Invalid zip");
      });
      return deferred.promise;
    }

    DemographicService.prototype.getCountiesForZipInDemographicData = function(zip, demographicData){
      var counties = null;
      if(demographicData && demographicData.length){
        counties = demographicData.map(function(data){
        return data.county;
        });
      }
      return counties;
    }

     DemographicService.prototype.getStateForCountyInDemographicData = function(county, demographicData){
      var state = null;
      if(demographicData){
      for(var i = 0; i < demographicData.length; i++){
          var data = demographicData[i];
          if(county == data.county){
            state = data.stateCode;
            break;
          }
        }
      }
      return state;
    }


    // Public API for configuration
    this.setDemographicUrl = function (url) {
      demographicUrl = url;
    };

    // Method for instantiating
    this.$get = ["$http", "$q","$log", function (http, q, $log) {
      if(!demographicUrl){
        $log.error("Please provide demographic url");
        return;
      }
      $http = http;
      $q = q;
      return new DemographicService();
    }];
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcPastDate
 * @description
 * #Overview
 * 'hcPastDate' directive is used to check that the entered date is the past date
 * or not.
 *
 * @restrict A
 * @requires ngModel
 *
 * @element input type="text"
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <form name="dummyForm">
            <input type="text" hc-past-date="true" id="dateInput" name="dateInput" ng-model="model.date">
        </form>
        Is this a past date? : {{dummyForm.$valid}}
     </file>
    </example>   
 */
angular.module('hcUiApp')
  .directive('hcPastDate', function() {
    return {
    	restrict: "A",
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            model.$parsers.push(function (value) {
            	var isValid = true;
            	if(value){
            		var month, day, year;
                	month = value.substring(0, 2);
                	day = value.substring(3, 5);
                	year = value.substring(6, 10);
                	var date = new Date();
                	date.setFullYear(year, month - 1, day);
                    isValid = date <= new Date();
                    model.$setValidity('hcPastDate', isValid);              
            	}
            	return isValid ? value : undefined;
            });
        }
    };
});
'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcEqual
 *
 * @description
 * #Overview
 * 'hcEqual' directive compares two input elements.
 * If these two inputs are equal than the 
 * validity will be true otherwise validity will be false.
 * 
 * @restrict A
 * @requrires ngModel
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <form name="dummyForm">
            <input type="text" name="firstValue" id="firstInput" ng-model="model1" >
            <input type="text" name="secondValue" hc-equal="model1" id="secondInput" ng-model="model2" >
        </form>
        Validity: {{dummyForm.$valid}}
     </file>
    </example>
 */
angular.module('hcUiApp')
  .directive('hcEqual', function() {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.hcEqual) {
                console.error('hcEqual expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.hcEqual, function (value) {
                model.$setValidity('hcEqual', value === model.$viewValue);
            });
            model.$parsers.push(function (value) {
                var isValid = value === scope.$eval(attrs.hcEqual);
                model.$setValidity('hcEqual', isValid);
                return isValid ? value : undefined;
            });
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcSelectOne
 * @description
 * # hcSelectOne
 */
angular.module('hcUiApp')
 .directive('hcSelectOne', function(){
	return {
		restrict: "A",
		require: 'ngModel',
		link : function(scope, elem, attrs, model){
			model.$parsers.unshift(function(viewValue){
				if(angular.isArray(viewValue) && viewValue.length == 0){
					model.$setValidity("hcSelectOne",false);
					return [];
				}
				model.$setValidity("hcSelectOne", true)
				return viewValue;
			})
		}
	}
});

'use strict';

/**
 * @ngdoc function
 * @name hcUiApp.controller:HcvalidationCtrl
 * @description
 * # HcvalidationCtrl
 * Controller of the hcUiApp
 */
angular.module('hcUiApp')
  .controller('HcvalidationCtrl', ["$scope",function ($scope) {
   $scope.pattern = {
			date: /^(?=\d)(?:(?:(?:(?:(?:0?[13578]|1[02])(\/|-|\.)31)\1|(?:(?:0?[1,3-9]|1[0-2])(\/|-|\.)(?:29|30)\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})|(?:0?2(\/|-|\.)29\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))|(?:(?:0?[1-9])|(?:1[0-2]))(\/|-|\.)(?:0?[1-9]|1\d|2[0-8])\4(?:(?:1[6-9]|[2-9]\d)?\d{2}))($|\ (?=\d)))?(((0?[1-9]|1[012])(:[0-5]\d){0,2}(\ [AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2})?$/,
			alpha : /^[a-zA-Z\_]+$/,
			email : /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
			numeric : /^[1-9]\d*(\.\d+)?$/,
   			percent : /^([0-9]?\d{1}|100)$/
	};
}]);

'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:range
 * @function
 * @description
 * # range
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
.filter("range", function(){
     return function(val, range) {
            var rangeArray = range.split(","),
            rangeMin, rangeMax;
            if(rangeArray.length == 2){
                rangeMin = parseInt(rangeArray[0]);
                rangeMax = parseInt(rangeArray[1]);
            }
            else{
                rangeMin = 0;
                rangeMax = parseInt(rangeArray[0]);
            }
            for (var i=rangeMin; i<rangeMax; i++)
              val.push(i);
            return val;
          };
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:dynamicName
 * @description
 * 
 * Add name attribute to the form elements dynamically.
 *
 * @restricts A
 * @requires ngModel
 * @requires form
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <div ng-controller="DemoController">
            <form name="dummyForm" >
              Required Field: <input type="text" id="name" dynamic-name="dynamicName" ng-model="model" ng-required="true">
                
            </form>
            {{dummyForm.name1.$error.required}}
        </div>
     </file>

     <file name="script.js">
        'use strict';


        angular.module('hcUiApp')
        .controller("DemoController", function($scope){
        $scope.dynamicName = "name1";
        });

     </file>
   </example>
 */
angular.module('hcUiApp')
  .directive("dynamicName",function(){
    return {
        restrict:"A",
        require: ['ngModel', '^form'],
        link:function(scope,element,attrs,ctrls){
            ctrls[0].$name = scope.$eval(attrs.dynamicName) || attrs.dynamicName;
            ctrls[1].$addControl(ctrls[0]);
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcMultiSelect
 * @description
 * #Overview
 * 'hcMultiSelect' directive facilitates user to select one or more options.
 *
 * @requires $compile
 * @requires ngModel
 * @requires hcMultiSelect
 * @restrict A
 * @priority 1
 * @scope
 *
 * @example
    <example module="hcUiApp">
     	<file name="index.html">
      		<form name="dummyForm">
		        <select name="days" id="select_days" ng-model="model.days" hc-multi-select="true" ng-disabled="disabled">
			      <option value="01">Monday</option>
			      <option value="02">Tuesday</option>
			      <option value="03">Wednesday</option>
			      <option value="04">Thursday</option>
			      <option value="05">Friday</option>
			      <option value="06">Saturday</option>
			      <option value="07">Sunday</option>
		      	</select>
	        </form>
     </file>
   </example>
 *
 *
 *
 */
angular.module('hcUiApp')
  .directive("hcMultiSelect", ["$compile",function($compile){
	return {
		require :["ngModel","hcMultiSelect"],
		restrict : "A",
		priority : 1,
		scope:{
			
		},
		controller : ["$scope", function($scope){
			this.getModel = function(multiModel){
				var model;
				if(multiModel){
					model = [];
					_.each(multiModel, function(value, key){
					if(value){
						model.push(key);
					}
				});
				}
				return model;
			};
			this.getMultiModel = function(model){
				var multiModel;
				if(model){
					multiModel = {};
					_.each(model, function(val){
						multiModel[val] = true;
					});
				}				
				return multiModel;
			};
		}],
		link : function(scope, element, attr, controllers){
			var modelController = controllers[0],
			hcMultiSelectController = controllers[1];
			element.multipleSelect({
				placeholder: 'Select Benefits',
				selectAll: false
			});
			modelController.$render = function(){
				scope.multiModel = hcMultiSelectController.getMultiModel(modelController.$viewValue);
			};
			var $parent =  element.next('.ms-parent');
			$parent.find('button.ms-choice').addClass('sbox-style');
			var $checkbox = $parent.find('input');
			$checkbox.addClass('hc-custom-input');
			$checkbox.parent('label').addClass('customCheckBox');
			$.each($checkbox, function( index, value ) {
				  value.setAttribute('ng-model','multiModel["'+value.value+'"]');
				});
			$('.customSelect.multiSelect').next('.ms-parent').hide();
			$compile($parent.contents())(scope);
			scope.$watchCollection("multiModel", function(val){
				var newModel = hcMultiSelectController.getModel(val);
				modelController.$setViewValue(newModel);
			});
			
		}
	};
}]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcGreaterThan
 * @description
 * #Overview
 * 'hcGreaterThan' directive compares two input elements.
 * If first input is greater than the second input, then the
 * validity will be true otherwise validity will be false.
 * 
 * @restrict A
 * @requrires ngModel
 *
 * @element input type="text"
 *
 * @example
   <example module="hcUiApp">
     <file name="index.html">
        <form name="dummyForm">
           Value 1: <input type="text" name="firstValue" hc-greater-than="model.input2" id="firstInput" ng-model="model.input1" ><br>
           Value 2: <input type="text" name="secondValue"  id="secondInput" ng-model="model.input2" >
        </form>
        Is first value greater than the second value? : {{dummyForm.$valid}}
     </file>
    </example>
 */
angular.module('hcUiApp')
  .directive('hcGreaterThan', function() {
    return {
    	restrict: "A",
        require: 'ngModel',
        link: function (scope, elem, attrs, model) {
            if (!attrs.hcGreaterThan) {
                console.error('hcGreaterThan expects a model as an argument!');
                return;
            }
            scope.$watch(attrs.hcGreaterThan, function (value) {
                model.$setValidity('hcGreaterThan', value > model.$viewValue);
            });
            model.$parsers.push(function (value) {
                var isValid = value > scope.$eval(attrs.hcGreaterThan);
                model.$setValidity('hcGreaterThan', isValid);
                return isValid ? value : undefined;
            });
        }
    };
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcPageLink
 * @description
 * #Overview
 * 'hcPageLink' directive is used to redirect onto another webpage.
 * 
 * @requires $location
 * 
 * @example 
 	<example module="hcUiApp">
     <file name="index.html">
       <button class="btn btn-primary" hc-page-link = "https://docs.angularjs.org/api/">Home</button>
     </file>
    </example>
 */
angular.module('hcUiApp')
.directive('hcPageLink', ['$location', function($location) {
    return {
        link: function(scope, element, attrs) {
            element.on('click', function() {
            	if(! $(element).attr("disabled")){
            		scope.$apply(function() {
                   		window.location.href=scope.$eval(attrs.hcPageLink);
                	});
            	}
            });
        }
    }
}]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.utils
 * @description
 * # utils
 * Service in the hcUiApp.
 */
angular.module('hcUiApp')
    .service('utils', ["dateFormat", function utils(dateFormat) {
        this.formatDate = function(dateObj) {
            return HCUtils.formatDate(dateObj, dateFormat);
        }
		
		this.updateMaxValue=function(min,max,step){

        var maxValue = max,
                minValue=min,
                stepValue=step,
                delta = maxValue - minValue,
                stepRemainder = delta%stepValue;
                if(stepRemainder){
				
				  if(delta < stepValue){
					maxValue = minValue + stepValue;
				  }
				  else{
					maxValue = maxValue + stepValue - stepRemainder;
				  }                    
                }                
                return maxValue;
          }


       
    }]);
'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:percent
 * @function
 * @description
 * # percent
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
  .filter('percent', function () {
    return function (input) {
    	return (input) ? input + "%" : input; 
    };
  });

'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:hyphenate
 * @function
 * @description
 * # hyphenate
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
  .filter('hyphenate', function () {
    return function (input) {
      return (input) ? input : "-";
    };
  });

'use strict';

/**
 * @ngdoc filter
 * @name hcUiApp.filter:triggerFilter
 * @function
 * @description
 * # triggerFilter
 * Filter in the hcUiApp.
 */
angular.module('hcUiApp')
  .filter('triggerFilter', ["$filter", function ($filter) {
    return function (input, type) {
    	var args = [input];
    	Array.prototype.push.apply(args, Array.prototype.slice.apply(arguments, [2]));
    	return $filter(type).apply(this, args);
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.transformRequestAsFormPost
 * @description
 * # transformRequestAsFormPost
 * Service in the hcUiApp.
 */
angular.module('hcUiApp')
  .factory('transformRequestAsFormPost', function transformRequestAsFormPost() {
  	return function(data, getHeaders){
  		var headers = getHeaders();
        headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
 		return $.param(data);
  	}
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcFormSubmit
 * @description
 * #Overview
 * 'hcFormSubmit' directive is used to sumbit the form by user.
 *
 * @requires ngModel
 * @restrict A
 * @scope
 *
 * @example
    <example module="hcUiApp">
      <file name="index.html">
        <div class="form-group">
          <label>Name:</label>
          <input name="name" class="form-control" />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input name="email" class="form-control" />
        </div>
        
        <div class="radio">
          <label>
          <input type="radio" name="junkmail" value="yes" checked />
          Yes, send me endless junk mail
          </label>
        </div>
        
        <div class="radio">
          <label>
          <input type="radio" name="junkmail" value="no" />
          No, I never want to hear from you again
          </label>
        </div>
        
        <div class="checkbox">
          <label>
          <input type="checkbox" />
          I agree to the terms and conditions.
          </label>
        </div>
        
        <input type="button" class="btn btn-primary" value="Submit" hcFormSubmit="submit" />
    </file>
   </example>
 
 */
angular.module('hcUiApp').directive('hcFormSubmit', function() {
 return {
  restrict : 'A',
  scope : {
   submit : "=hcFormSubmit"
  },
  link : function(scope, element, attrs) {
   
   scope.$watch("submit", function (newValue) {
      if(newValue==true){
       element.submit();
      }
    });
  }
 };
});

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcEqualHeightParent
 * @description
 * # hcEqualHeightParent

 * @restrict A
 * @requires $window
 *
 *

 */
angular.module('hcUiApp')
  .directive('hcEqualHeightParent', ["$window",function ($window) {
    return {
        restrict: 'A',
        controller: ["$scope",function($scope) {
        }],
        link: function($scope, element, attrs) {
          function applyEqualHeights(elements){
            var tallest = 0;
          elements.each(function(){
            var $element = angular.element(this);
            var thisHeight = $element.outerHeight();
              if( thisHeight > tallest)
                  tallest = thisHeight;
          });
          // set each items height to use the tallest value found
          elements.each(function(){
              angular.element(this).css('min-height',tallest);
          });
          }
          var win = angular.element($window),
          children = element.find('[hc-equal-height-child]');
          if( win.width() < 768){
          children.css('min-height',"");
      }else {
          applyEqualHeights(children);
      } 
        }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcEqualHeightChild
 * @description
 * # hcEqualHeightChild
 *
 * @restrict A
 * @requires hcUiApp.directive:hcEqualHeightParent
 *
 * @scope
 *
 * 
 */
angular.module('hcUiApp')
  .directive('hcEqualHeightChild', function () {
    return {
      	
      	restrict: 'A',
      	require: '^hcEqualHeightParent',
      	scope: {},
      	link: function(scope, element, attrs) {
        	
      	}
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcPopover
 * @description
 * # hcPopover
 */
angular.module('hcUiApp')
    .directive("hcPopover", function() {
        return {
            link: function(scope, element, attrs) {
                var $popoverControl = element.find("._popoverControl"),
                    $popoverBody = element.find("._popoverContent");
                $popoverControl.popover({
                    html: true,
                    content: $popoverBody.html(),
                    placement: attrs.placement,
                    trigger: "focus"
                });
            }
        }
    });
'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcTooltip
 * @description
 * # hcTooltip
 */
angular.module('hcUiApp')
    .directive("hcTooltip", function() {
        return {
            link: function(scope, element, attrs) {
                function initTooltip(options, element) {
                    var defaultOptions = {
                        title: attrs.hcTooltip
                    };
                    angular.extend(defaultOptions, options);
                    element.tooltip('destroy');
                    element.tooltip(defaultOptions);
                }
                scope.$watchCollection(attrs.hcTooltipOptions, function(options) {
                    initTooltip(options, element);
                });
                initTooltip(scope.$eval(attrs.hcTooltipOptions), element)
            }
        };
    });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcCheckboxFilter
 * @description
 * # hcCheckboxFilter
 */
angular.module('hcUiApp')
  .directive('hcRadioFilter', ["quotesFilter",function (quotesFilter) {
    return {
      template: "<hc-radio-group type='horizontal'></hc-radio-group>",
      restrict: 'E',
      controller : ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
        var predicate = $attrs.predicate,
        filterCriteria = $scope.filterCriteria,
        criteria = null;
        if(filterCriteria[predicate]){
          criteria = filterCriteria.criteria;
        }
        var equalFilter = quotesFilter.createEqualFilter(criteria);
        filterCriteria[predicate] = equalFilter;
      }],
      compile : function(element, attrs){
        var $hcRadioGroup = element.find("hc-radio-group");
        $hcRadioGroup
        .attr("items", attrs.items)
        .attr("ng-model","filterCriteria['"+attrs.predicate+"'].criteria")        
        .attr("id", attrs.id);
      }
    };
  }]);

'use strict';
/**
 * @ngdoc directive
 * @name hcUiApp.directive:hcCheckboxGroup
 * @description
 * # hcCheckboxGroup
 */
angular.module('hcUiApp')
  .directive('hcRadioGroup', ["templateURL","$http","$templateCache","$compile", function (templateURL, $http, $templateCache, $compile) {
    return {
      require : ['ngModel','hcRadioGroup'],
      restrict: 'E',
      scope : {
        items : '=',
        name: '@',
        id: '@'
      },
      controller : ["$scope", function($scope){
        this.getItems = function(){
          if(angular.isArray($scope.items)){
            var items = {};
            _.each($scope.items, function(value){
              items[value] = value;
            });
            return items;
          }
          return $scope.items;
        }
      }],
      link : function($scope, element, attrs, controllers){
        var ngModelController = controllers[0],
        hcRadioGroupController = controllers[1];
        $scope.resolvedItems = hcRadioGroupController.getItems();
        var keys = Object.keys($scope.resolvedItems);
        $scope.radioGroup = {};

    
        $scope.$watch('radioGroup.model', function(newValue){
          ngModelController.$setViewValue(newValue);          
        });
        ngModelController.$render = function(){
          $scope.radioGroup.model = ngModelController.$viewValue || '';
        }
        $http.get(templateURL.getUrl("hc-radio-group-"+attrs.type),{
          cache: $templateCache
        }).success(function(result){
           element.html(result).show();
           $compile(element.contents())($scope);
        });
      }
    };
  }]);
'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.PromiseService
 * @description
 * # PromiseService
 * Service in the hcUiApp.
 */
angular.module('hcUiApp')
  .service('PromiseService', ["$rootScope",function PromiseService($rootScope) {
    this.setPromise = function(prms){
		$rootScope.$broadcast("promiseChanged",prms);
	}
  }]);

'use strict';

/**
 * @ngdoc service
 * @name hcUiApp.specialCharactersWhiteListService
 * @description
 * # specialCharactersWhiteListService
 * Provider in the hcUiApp.
 */
angular.module('hcUiApp')
  .provider('specialCharactersWhiteListService', function () {

    // Private variables
    var _whiteListCharacters;

    var getRegex = function () {
      var regex;
      regex  = '^['+_whiteListCharacters.join("")+']*$';
       return new RegExp(regex);
    };

    // Public API for configuration
    this.setWhiteListCharacters = function(whiteListCharacters){
      _whiteListCharacters = whiteListCharacters;
    }

    this.addWhiteListCharacter = function (whiteListCharacter){
      _whiteListCharacters.push(whiteListCharacter);
    }

    this.removeWhiteListCharacter = function (whiteListCharacter){
      _whiteListCharacters.splice(_whiteListCharacters.indexOf(whiteListCharacter),1);
    }

    // Method for instantiating
    this.$get = function () {
      var regex = getRegex();
      return {
         isValid: function(data){
          return regex.test(data);
         }
      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name hcUiApp.directive:scopeAge
 * @description
 * # scopeAge
 */
angular.module('hcUiApp')
  .directive('scopeAge', ["$interval",function ($interval) {
    return {
      template: '<div>This scope is {{age || 0}} seconds old</div>',
      restrict: 'E',
      link: function(scope, element, attrs) {
        function instrument($scope) {
	        var scopeCreated = Date.now();
	        var computeAge = function () {
	          var delta = Date.now() - scopeCreated;
	          $scope.ageMs = delta;
	          $scope.age = Math.floor(delta / 1000);
	        };
	        computeAge();
	        var intervalPromise = $interval(computeAge, 1000);
	        $scope.$on("$destroy", function () {
	          $interval.cancel(intervalPromise);
	        })
      	}
      	instrument(scope);
      }
    };
  }]);
