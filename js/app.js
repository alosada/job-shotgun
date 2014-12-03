window.addEventListener('load',function(){
  controller = new Controller
  user = new User
  navigator.geolocation.getCurrentPosition(function(location){user.coords = location.coords})
  view = new View
  var models = {
    indeed: new Indeed(1896679652531742),
   geocoder: new MyGeocoder
  }
  controller.initialize( view, models)
  controller.bindListeners()
  controller.checkCoords()
})

function Controller(){}

Controller.prototype = {
  initialize: function(view, models){
    this.models = models;
    this.view = view;
  },
  bindListeners: function(){
    $("form").on("submit", this.updateSearch)
  },
  checkCoords: function(){
    var checkCoords = setInterval(function(){
      if(user.coords){
        clearInterval(checkCoords)
        controller.models.geocoder.getAddress()
        controller.checkAddress()
      }
    },300)
  },
  checkAddress: function(){
    var checkAddress = setInterval(function(){
      if(user.city){
        controller.models.indeed.getJobs()
        clearInterval(checkAddress)
        controller.checkJobs()
      }
    },300)
  },
  checkJobs: function(){
    var checkJobs = setInterval(function(){
      if(user.jobs){
        clearInterval(checkJobs)
        controller.view.setInitialFormValues()
        controller.view.showJobs()
      }
    },300)
  },
  updateSearch: function(e){
    e.preventDefault()
    var formData = $(this).serializeArray()
    user.updateInfo(formData)
    controller.models.indeed.getJobs()
  }
}

function User(){
  this.career = "Web Developer"
  this.radius = "25"
  this.days = "1"
}

User.prototype = {
  updateInfo: function(data){
    user.career = data[0].value
    user.city = data[1].value
    user.state = data[2].value
    user.country = data[3].value
    user.days = data[4].value
    user.radius = data[5].value
  }
}

function View(){}

View.prototype = {
  showJobs: function(){
    $('[data-comp="loading"]').hide()
    $('[data-comp="job-container"]').show()
  },
  setInitialFormValues: function(){
    var formFields = $('input')
    formFields[1].value = user.city
    formFields[2].value = user.state
    formFields[3].value = user.country
  }
}

function Indeed(key){
  this.key = key;
}

Indeed.prototype = {
  getJobs: function(jobSeeker){
    $.ajax({
      url: 'http://api.indeed.com/ads/apisearch?publisher='+this.key+'&format=json&l='+user.city+'%2C'+user.state+'&co='+user.country+'&v=2&q='+user.career+'&radius='+user.radius+'&fromage'+user.days+'&limit=20',
      dataType: 'jsonp',
      success: function(data){
        if(user.jobs){
          user.jobs.indeed = data.results
        }else {
          user.jobs = {indeed: data.results}
        }
      }
    })
  }
}

function MyGeocoder(){
  this.googleMaps = new google.maps.Geocoder();
}

MyGeocoder.prototype= {
  getAddress: function(){
    var p = new Promise(
      function(resolve,reject){
        user.LatLng = new google.maps.LatLng(user.coords.latitude,user.coords.longitude)
        resolve()
      }
    )
    p.then(function(){
      controller.models.geocoder.googleMaps.geocode({"latLng": user.LatLng}, function(results,sstatus){
        user.country = results[results.length-1].address_components[0].short_name
        user.state = results[results.length-2].address_components[0].short_name
        user.city = results[results.length-3].address_components[0].long_name
      })
    });
  },
}

function test(e){
  e.preventDefault()
  debugger
}
