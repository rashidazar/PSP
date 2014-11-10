(
function() {
    if(window.localStorage["loggedIn"] != "true") {
        window.localStorage["loggedIn"] = "false";
    }

    var ids = {
        pages : {
            home : '#home',
            login : '#login',
            jobTracker : '#jobTracker',
            shipStatus : 'shipStatus'
        },
        home : {
            homeIcons : '#home-icons'
        },
        jobTracker : {
            inprogress : '#in-progress',
            completed : '#completed',
            jobList : '#job-list'
        },
        shipStatus : {
            jobId : '#jobid'
        }
    };
 
    var constants = {
        status : {
            inprogress : 'inprogress',
            completed : 'completed'
        }
    };

    var User = {
        status : constants.status.inprogress,
        api : {
            login : "http://192.168.1.39/slim/index.php/psp/login",
            jobs : "http://192.168.1.39/slim/index.php/psp/jobs/"
        },

        isLoggedIn : function() {
            return (window.localStorage["loggedIn"] == "true");
        },

        setLoggedIn : function(isLoggedIn, auth_key) {
            window.localStorage["loggedIn"] = isLoggedIn == "true" ? isLoggedIn : "false";
            window.localStorage["auth_key"] = auth_key;
        },
 
         login : function(username, password) {
            /*$.ajax({
                type: 'POST',
                url: this.api.login,
                data: { username: username, password : password }
                })
            .done(function( msg ) {
               msg = $.parseJSON(msg);
               if(msg['status'] == 'OK') {
                  app.user.setLoggedIn('true', msg.auth_key);
                  $.mobile.changePage( ids.pages.home, { transition: "slide", changeHash: false });
               } else {
                  alert('Invalid username/password');
               }
            });*/
             app.user.setLoggedIn('true', 'rashid.azar');
            console.log('logged in')
             return true;
         },
 
         logout : function() {
            window.localStorage.clear();
         },
         
         getJobs : function(status, callback) {
            this.status = status;
            $.get(this.api.jobs + this.status, function(data, s) {
                  callback(data,s);
                } , 'json');
         },
         
         ui : {
             getJobs : function(data, clear) {
                 if('no' != clear) {
                    $(ids.jobTracker.jobList).empty();
                 }
                $.each(data, function(k, v) {
                    $('<li><a href="shipStatus.html?jobid=' + v.jobid + '">' + v.invoiceid + ' - ' + v.jobid + ': ' + v.status + '</a></li>').appendTo(ids.jobTracker.jobList);
                    });
                $(ids.jobTracker.jobList).listview('refresh');
             },
             
             getMoreJobs : function() {
                $.get(this.api.jobs + User.status, function(data, s) {
                      User.ui.getJobs(data,'no');
                   } , 'json');
             }
         }
	};
 
    var app = {
        // Application Constructor
        initialize: function() {
            this.bindEvents();
        },
        // Bind Event Listeners
        //
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
 //document.addEventListener('deviceready', this.onDeviceReady, false);

        },
        // deviceready Event Handler
        //
        // The scope of 'this' is the event. In order to call the 'receivedEvent'
        // function, we must explicitly call 'app.receivedEvent(...);'
        onDeviceReady: function() {
            //
        },
 
        isAtBottom : function(){
            /* You always need this in order to target elements within active page */
            var activePage = $.mobile.pageContainer.pagecontainer("getActivePage"),

            /* Viewport's height */
            screenHeight = $.mobile.getScreenHeight(),

            /* Content div - include padding too! */
            contentHeight = $(".ui-content", activePage).outerHeight(),

            /* Height of scrolled content (invisible) */
            scrolled = $(window).scrollTop(),

            /* Height of both Header & Footer and whether they are fixed
            If any of them is fixed, we will remove "1px"
            If not, outer height is what we need */
            header = $(".ui-header", activePage).hasClass("ui-header-fixed") ? $(".ui-header", activePage).outerHeight() - 1 : $(".ui-header", activePage).outerHeight(),
            footer = $(".ui-footer", activePage).hasClass("ui-footer-fixed") ? $(".ui-footer", activePage).outerHeight() - 1 : $(".ui-footer", activePage).outerHeight(),

            /* Math 101 - Window's scrollTop should match content minus viewport plus toolbars */
            scrollEnd = contentHeight - screenHeight + header + footer;

            /* if "pageX" is active and page's bottom is reached do whatever you want */
            return scrolled >= scrollEnd;
        },
 
         requireAuthentication : function(e) {
             e.preventDefault();
             if(User.isLoggedIn()) {
                 $.mobile.changePage( $(this).attr('href'), { transition: "slide" });
             } else {
                 app.user.nextPage = $(this).attr('href');
                 $.mobile.changePage( '#login', { transition: "slide", changeHash: false });
             }
         },
 
        getRoute : function(source, destination, mapid) {
            console.log("Source : " + source);
            console.log("Destination : " + destination);
            $(mapid).gmap3({
                        getroute:{
                        options:{
                        origin: source,
                        destination: destination,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                        },
                        callback: function(results){
                        $(this).gmap3();
                        if (!results) return;
                        
                        $(this).gmap3({
                                      map:{
                                      options:{
                                      zoom: 13,
                                      center: [-33.879, 151.235]
                                      }
                                      },
                                      directionsrenderer:{
                                      options:{
                                      directions:results
                                      }
                                      }
                                      });
                        }
                        }
                        });
        },
 
		onLocationSuccess : function(pos) {
			app.getRoute(pos.coords.latitude + ', ' + pos.coords.longitude, $('#destination').text().trim(), '#map-view');
		},

		onError : function(e) {
			alert(e.message);
		}
    };
    app.user = User;
    app.ids = ids;
    app.constants = constants;
	window.app = app;

 // event will get executed on every page load
$(document).on('pagebeforeshow', function() {
	onDeviceReady();
});

 /************************** home page **************************/
 $(document).on('click', '#liJobTracker a', app.requireAuthentication);
 $(document).on('click', '#liLocation a', app.requireAuthentication);
 $(document).on('click', '#liNotification a', app.requireAuthentication);
 $(document).on('click', '#btnLogin', function(e){
                e.preventDefault();
                if(app.user.login($('#username').val(), $('#password').val())) {
                    $.mobile.changePage( app.user.nextPage, { transition: "slide" });
                    app.user.nextPage = '';
                }
                return false;
            });

 /************************** locations page **************************/
 $(document).on('click', '.locations', function(e) {
				   var dest = $(this).text().trim();
				   window.navigator.geolocation.getCurrentPosition(function(pos) {
																   app.getRoute(pos.coords.latitude + ', ' + pos.coords.longitude, dest, '#map-location');
																}, app.onError);
});
 
/************************** locations page **************************/
 $(document).on('click', '.logout-btn', function(e) {
				app.user.logout();
				$.mobile.changePage( app.ids.pages.home, { transition: "slide", changeHash: false });
				});
// Cordova is ready
function onDeviceReady() {
	if($.mobile.activePage.attr('id') == 'pickUp') {
		window.navigator.geolocation.getCurrentPosition(app.onLocationSuccess, app.onError);
	}
}

/************************** jobs list page **************************/
 $(document).on('click', '#jobList li', function(e) {
				//e.preventDefault();
				var li = $(this);
				var status = li.find('p.status').text().trim();
				if(status.match(/Ready for pickup/ig)) {
					$('#job-status').html('<a href="#pickUp">' + status + '</a>');
				} else if(status.match(/Shipped/ig)) {
					$('#job-status').html('<a href="#shipStatus">' + status + '</a>');
				} else {
					$('#job-status').text(status);
				}
			});
 
 ///////////////////////////start execution//////////////////////////////////
app.initialize();
(function($){
$('#home').height(300);
$('.call-btn').on('click',
				function(e) {
				//window.location.href = 'tel:12345';
				console.log(navigator.plugins);
				phonedialer.dial("800-511-2009",
								 function(err) {
									if (err == "empty") alert("Unknown phone number");
									else alert("Dialer Error:" + err);
								 },
								 function(success) {
									alert('Dialing succeeded');
								 }
								 );
				});
})(jQuery);
// Wait for Cordova to load
document.addEventListener("deviceready", onDeviceReady, false);
})()