angular.module('mymasjid.controllers')
.controller('BaseCtrl', function(
   $scope,
   $ionicModal,
   $state,
   $ionicSideMenuDelegate,
   $ionicPlatform,
   $cordovaPushV5,
   $q,
   appConfig,
   Restangular,
   PushRegistration,
   SavedMasjid,
   $ionicPopup,
   $cordovaLaunchNavigator
 ) {

  var ctrl = this;
  $scope.global = {};

  ctrl.pushesAreEnabled = true;

  function init(){
    getStoredMasjids().then(
      registerForPush);
    clearPushBadges();
  }

  function getStoredMasjids(){
    return SavedMasjid.getMasjids().then(function(storedMasjids){
      $scope.otherMasjids = storedMasjids.slice(1);
      if(storedMasjids.length == 0)
        return null;
      else
        return storedMasjids[0];
    }).then(function(storedMasjid){
      $scope.global.selectedMasjid = storedMasjid;
    });
  };

  ctrl.hideSideMenu = function(){
    $ionicSideMenuDelegate.toggleLeft(false);
    return true;
  }

  ctrl.openChild = function(stateName){
    $state.go(stateName);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  ctrl.toggleShowingOtherMasjids = function(){
    ctrl.showingOtherMasjids = !ctrl.showingOtherMasjids;
    return true;
  }

  ctrl.setSelectedMasjid = function(masjid){
    return SavedMasjid.setSelected(masjid).then(function(selectedMasjid){
      $scope.global.selectedMasjid = masjid;
      $scope.$broadcast("mymasjid.selectedMasjidChanged");
    })
    .then(getStoredMasjids)
    .then(registerForPush);
  }

  ctrl.removeMasjid = function(masjid){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Remove Masjid?',
       template: 'Are you sure you want to remove this masjid?'
     });

    confirmPopup.then(function(confirmed) {
     if(!confirmed)
       return;
     SavedMasjid.removeStoredMasjid(masjid).then(function(storedMasjid){
       console.log("Removed masjid", storedMasjid);
     }).then(getStoredMasjids);
    });
  }

  ctrl.canNavigate = function(){
    if($scope.global.selectedMasjid == null){
      return false;
    }
    return true;
  }

  ctrl.navigateToMasjid = function(masjid){
    var destination = [masjid.latitude, masjid.longitude];
    var start = null;
    $cordovaLaunchNavigator.navigate(destination, start).then(function() {
      console.log("Navigator launched");
    }, function (err) {
      console.error(err);
    });
  };

  function registerForPush(){
    $ionicPlatform.ready(function() {
      checkIfPushesEnabled();
      var masjid = $scope.global.selectedMasjid;
      if(masjid == null)
        return;
      PushRegistration.initialize();
      PushRegistration.register(masjid.id).then(function(response){
        console.log("PushRegistration success response", response);
      }, function(errors) {
        console.log("Got errors", errors);
      }).finally(function() {
        checkIfPushesEnabled();
      });
    });
  }

  function checkIfPushesEnabled(){
    PushRegistration.isPushEnabled().then(function(isEnabled){
      ctrl.pushesAreEnabled = isEnabled;
    });
  }

  function clearPushBadges(){
    $ionicPlatform.ready(function(){
      $cordovaPushV5.setBadgeNumber(0);
    });
  }

  $ionicPlatform.on('resume', function(){
    console.log("Resuming application...");
    init();
  });

  $scope.$on("$ionicView.enter", function(){
    init();
  });
});
