describe('BrowseProductsCtrl', function () {

    var $scope, $rootScope, $controller, mockedGlobalData, $q, mockedCategory={ id:123};
    var productResult, priceResult, browseProdCtrl, mockedProductSvc, mockedPriceSvc, deferredProducts, deferredPrices;

    mockedGlobalData = {};
    mockedGlobalData.store = {};
    mockedGlobalData.products = {};
    mockedGlobalData.products.meta = {};
    mockedGlobalData.products.meta.total = 10;
    mockedGlobalData.getCurrencySymbol = jasmine.createSpy('getCurrencySymbol').andReturn('USD');

    var mockedState = { transitionTo: jasmine.createSpy()};

    var mockedCategorySvc = {};
    var mockedSettings = {placeholderImage: 'image', headers: { paging: {total: 'x'}}};

    //***********************************************************************
    // Common Setup
    // - shared setup between constructor validation and method validation
    //***********************************************************************

    //beforeEach(angular.mock.module('ds.shared'));
    // configure the target controller's module for testing - see angular.mock
    beforeEach(angular.mock.module('ds.products'));

    beforeEach(inject(function(_$rootScope_, _$controller_) {

        this.addMatchers({
            toEqualData: function (expected) {
                return angular.equals(this.actual, expected);
            }
        });
        $rootScope =  _$rootScope_;
        $scope = _$rootScope_.$new();
        $controller = _$controller_;

    }));


    beforeEach(inject(function (_$q_) {

        $q = _$q_;
        mockedProductSvc = {};
        productResult = [
            {'name': 'prod1'}
        ];
        productResult.headers =  [];
        deferredProducts = $q.defer();
        deferredProducts.resolve(productResult);
        mockedProductSvc.query = jasmine.createSpy('query').andReturn(deferredProducts.promise);

        priceResult = [];
        deferredPrices = $q.defer();
        deferredPrices.resolve(priceResult);

        mockedPriceSvc = {};
        mockedPriceSvc.query =  jasmine.createSpy('query').andReturn(deferredPrices.promise);
    }));

    describe('Initialization', function () {

        var selectedCat;



        beforeEach(function () {
            $rootScope.$on('category:selected', function(eve, obj){
                selectedCat = obj.category;
            });

            browseProdCtrl = $controller('BrowseProductsCtrl',
                {'$scope': $scope, '$rootScope': $rootScope, 'ProductSvc': mockedProductSvc, 'PriceSvc':mockedPriceSvc, 'GlobalData':mockedGlobalData,
                    'settings': mockedSettings, 'category': mockedCategory, '$state': mockedState, 'CategorySvc': mockedCategorySvc});
        });

        it('should set image placeholder', function(){
            expect($scope.PLACEHOLDER_IMAGE).toBeTruthy();
        });

        it('should fire category:selected event', function(){
            expect(selectedCat).toEqualData(mockedCategory);
        });

        it('should query products', function () {
            $scope.products = [];

            // trigger promise resolution:
            $scope.$digest();
            expect(mockedProductSvc.query).toHaveBeenCalled();
            // indirect testing via resolved promise
            expect($scope.products).toEqualData(productResult);
        });

    });

    describe('Initialize with category without elements', function(){
        beforeEach(function () {
            browseProdCtrl = $controller('BrowseProductsCtrl',
                {'$scope': $scope, '$rootScope': $rootScope,  'ProductSvc': mockedProductSvc, 'PriceSvc':mockedPriceSvc, 'GlobalData':mockedGlobalData,
                    'settings': mockedSettings, 'category': {elements:[]}, '$state': mockedState, 'CategorySvc': mockedCategorySvc});

        });

        it('should set count properties to zero', function(){
            expect($scope.products).toEqualData([]);
            expect($scope.productsFrom).toEqualData(0);
            expect($scope.productsTo).toEqualData(0);
            expect($scope.total).toEqualData(0);
        });

    });

    describe('function', function() {
        beforeEach(function () {
            browseProdCtrl = $controller('BrowseProductsCtrl',
                {$scope: $scope, '$rootScope': $rootScope, 'ProductSvc': mockedProductSvc, 'PriceSvc': mockedPriceSvc, 'GlobalData': mockedGlobalData,
                    'settings': mockedSettings, 'category': mockedCategory, '$state': mockedState, 'CategorySvc': mockedCategorySvc});
        });


        describe('addMore', function () {

            it(' should query products and add them to the scope if no sorting', function () {
                $scope.products = [];
                $scope.addMore();
                // validate that "add more" added products returned by query to the scope
                expect(mockedProductSvc.query).toHaveBeenCalled();
                // expect($scope.products).toEqualData(products);
            });

            it('should not query products if sorting enabled', function () {
                $scope.sort = 'price';
                mockedProductSvc.query.reset();
                $scope.addMore();
                expect(mockedProductSvc.query.callCount).toBe(0);
            });

        });

        describe('setSortedPage', function () {
            it('setSortedPage should update current page and query products', function () {

                $scope.setSortedPage();
                expect(mockedProductSvc.query).toHaveBeenCalled();
                expect($scope.setSortedPageNumber).toBe(1)
            });
        });

        describe('setSortedPage product Loading scenarios ', function(){
            beforeEach(function(){
                $scope.total = 36;
                $scope.pageSize = 8;
            });
            it('the current product page is 1 setSorted should load the first 8 products', function(){

                $scope.pageNumber = 1;
                $scope.setSortedPage();
                expect($scope.setSortedPageSize).toBe(8)

            });

            it('the current product page is 3 so setSorted should load the first 24 products', function(){

                $scope.pageNumber = 3;
                $scope.setSortedPage();
                expect($scope.setSortedPageSize).toBe(24)

            });

            it('the current product page is 5 so setSorted should return all of the products from the query', function(){
                $scope.pageNumber = 5;
                $scope.setSortedPage();
                expect($scope.setSortedPageSize).toBe($scope.total)
            });

        });

        describe('backToTop', function () {
            it('should scroll to 0, 0', function () {
                window.scrollTo(0, 5);
                $scope.backToTop();
                expect(window.pageYOffset).toEqualData(0);
            });
        });

        describe('showRefineContainer', function(){
           it('should toggle refineContainerShowing', function(){
              $scope.refineContainerShowing = false;
               $scope.showRefineContainer();
               expect($scope.refineContainerShowing).toBeTruthy();
               $scope.showRefineContainer();
               expect($scope.refineContainerShowing).toBeFalsy();
           });
        });

    });

});