angular.module('mymasjid.controllers')
.controller('DailyTimingsCtrl', function($scope, Restangular, $localForage) {
  var ctrl = this;
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    getStoredMasjid()
      .then(ctrl.loadTimings);
  }

  ctrl.loadTimings = function(cachedMasjid){
    ctrl.error = false;
    ctrl.isLoading = true;
    ctrl.masjid = cachedMasjid;
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: cachedMasjid.id
    };
    baseSalahTimings.customGET("daily.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      var timing = masjid.salah_timing;
      ctrl.timing = timing;
    }, function(response){
      ctrl.masjid = storedMasjid;
      ctrl.error = true;
      if(response.data){
        ctrl.errorMsg = response.data.errors.join(", ");
      }
      else{
        ctrl.errorMsg = "Couldn't connect to MasjidNow. Pleae check your internet connection."
      }
    }).finally(function(){
      ctrl.isLoading = false;
    });
  };

  function getStoredMasjid(){
    return $localForage.getItem('cachedMasjids').then(function(cachedMasjids){
      //TODO FIXME REMOVE THIS BELOW
      return {id: 0};
      //TODO FIXME REMOVE THIS ABOVE
      if(cachedMasjids == null || cachedMasjids.length == 0)
        return null;
      else
        return cachedMasjids[0];
    });
  }


  init();

});
