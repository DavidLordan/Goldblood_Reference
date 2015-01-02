/*
 
 File: assign9script.js
 91.461 GUI Programming 1, Assignment 9: Using AngularJS
 David Lordan, UMass Lowell Computer Science, david_lordan@student.uml.edu
 Alternate email: davidlordan@gmail.com
 Created on Dec 6th, 2014 11:30 AM, updated on Dec 10th, 2014 9:25 PM
 
 The purpose of this assignment is to demonstrate the use of AngularJS.
 Data is to be read from a JSON file via Ajax and dispalyed to the user.
 The user can then manipulate the data in some way.
 
 For this assignment I created a setlist/playlist maker. A list of Led Zeppelin
 songs taken from a JSON file are shown. The user may then use check-boxes to
 select songs which are to be added to a 2nd list. The ordering of the 2nd list
 may be manipulated by either clicking on a pair of songs which can be swapped,
 or by using a radio button to select a song that may be moved with up and down
 buttons. A running total of the length is shown at the bottom of the list.
 All of the listed information as well as the total length are filtered using
 AngularJS. The ng-class attribute is also used to add and remove classes
 which allow color coding of various states, such as showing which songs are 
 active.
 
 
 The majority of this code is based on the examples provided by Curran Kelleher
 which can be found at the following URL: 
 http://curran.github.io/screencasts/introToAngular/exampleViewer/#/
 
 Other parts of the code were taken from the sample code provided by 
 Prof. Jesse Heines for his GUI Programming 1 course at UMass Lowell.
 
 This file includes several custom function and makes extensive use of the AngularJS
 framework to control the page's behavior. 
 
 */



//Global variables
//  assing9 is the angular module for the entire page.
var assign9 = angular.module('assign9', []);

//  The total length of the setlist.
var total = 0;

// An array of the two songs which are currently swappable. 
var selected = [];

//AngularJS controller. 
assign9.controller("assign9Ctrl", function ($scope, $http) {

//Fetches the song list, stored in a JSON file, via AJAX
    $http.get('JSON/GB_songs.json').success(function (data) {
        $scope.myList = data;
    });

    // The next position of the song to be added. Also used to determine the number of songs
    // in the list. 
    $scope.nextPos = 0;
    $scope.playing = false;
    $scope.playbackIcon = "Resources/playIcon.png";
    $scope.audioActive = "";
    $scope.nowPlaying = "";
    $scope.currentSongList = "GB_songs";
    $scope.timeSpent = "";
    $scope.timeRemaining = "";
    $scope.tableName = "Finished Songs";
    var usingMouse = false;

    //The movable song is updated when the corresponding radio box is clicked.
    $scope.updateActive = function (i) {
        if ($scope.currentSongList === "GB_ideas" || $scope.currentSongList === "GB_songs") {

            $scope.nowPlaying = "";
            myAudio = document.getElementById('my-audio');
            $scope.playbackIcon = "Resources/playIcon.png";
            myAudio.pause();
            $scope.playing = false;

            if (myAudio.currentTime !== 0) {

                myAudio.currentTime = 0;
                $scope.timeRemaining = 0;
                $scope.timeSpent = 0;
                var bar = document.getElementById('bar');
                bar.style.width = 0;

            }

            if ($scope.moveActive !== i) {
                $scope.moveActive = i;
                $scope.audioActive = $scope.moveActive.name;
            }
            else {
                $scope.moveActive = "";
                $scope.audioActive = "";
            }
        }

        if ($scope.currentSongList === "GB_Notation") {
            window.open("http://davidlordan.github.io/Goldblood_Reference/Resources/" + i.name + ".pdf");
        }


    };

    $scope.download = function () {
        document.location.href = "https://github.com/DavidLordan/Goldblood_Reference/blob/gh-pages/Audio/GB_Songs.zip?raw=true";
    };

    //Adjusts playback icon
    $scope.togglePlayback = function () {

        var myAudio = document.getElementById('my-audio');

        if ($scope.audioActive !== "") {

            if ($scope.playing) {
                $scope.playing = false;
                $scope.playbackIcon = "Resources/playIcon.png";
                myAudio.pause();
            }
            else {
                $scope.nowPlaying = "Playing: \"" + $scope.audioActive + ".mp3\"";
                $scope.playing = true;
                $scope.playbackIcon = "Resources/pauseIcon.png";
                myAudio.play();
            }
        }
    };

    //Loads the finished list of songs
    $scope.changeList = function (listName) {

        $scope.currentSongList = listName;

        if (listName === "GB_songs") {
            $scope.tableName = "Finished Songs";
        }
        if (listName === "GB_ideas") {
            $scope.tableName = "Song Ideas";
        }
        if (listName === "GB_Notation") {
            $scope.tableName = "Notes";
        }

        //Fetches the song list, stored in a JSON file, via AJAX
        $http.get('JSON/' + listName + '.json').success(function (data) {

            $scope.myList = data;
        });

    };


    $scope.clickedPlayhead = function (e, doc) {
        var clickPosition = (e.pageX - doc.offsetLeft) / doc.offsetWidth;
        var p = $("#circle1");
        var position = p.position().left;
        var touchPos = 0;

        if (typeof e.originalEvent.targetTouches !== 'undefined') {
            var endCoords = e.originalEvent.targetTouches[0];
            touchPos = Math.floor(endCoords.pageX);
            return (Math.abs(position - touchPos) < 15);
        }
        else {
            return Math.abs(position - e.pageX) < 15;
        }


    };
    //Initializes and maintains progress bar
    $scope.load = function () {

        var progress = document.getElementById('progress');
        var myAudio = document.getElementById('my-audio');
        var bar = document.getElementById('bar');
        var playheadClicked = false;

        myAudio.addEventListener("ended", function () {
            $scope.playbackIcon = "Resources/playIcon.png";
            $scope.nowPlaying = "";
            $scope.$apply();
            $scope.togglePlayback();

            console.log($scope.nowPlaying);
            this.currentTime = 0;
        });
        myAudio.addEventListener('timeupdate', function () {

            $scope.timeSpent = Math.floor(myAudio.currentTime);
            $scope.timeRemaining = Math.floor(myAudio.duration) - Math.floor(myAudio.currentTime);
            $scope.$apply();
            if (!playheadClicked) {
                bar.style.width = parseFloat(((myAudio.currentTime / myAudio.duration) * 100), 10) + "%";
            }

        });

        $(progress).bind("mousedown", function (e) {
            console.log("touch");
            playheadClicked = $scope.clickedPlayhead(e, this);
        });

        if (mobileCheck()) {
            var startCoord = 0;
            $(progress).bind("touchstart", function (e) {
                startCoord = e.originalEvent.targetTouches[0].pageX;
                playheadClicked = $scope.clickedPlayhead(e, this);
            });
            $(document).bind('touchmove', function (e) {

                var endCoords = e.originalEvent.targetTouches[0];
                var mousePos = Math.floor(endCoords.pageX);
                var clickPosition = ((mousePos - progress.offsetLeft) / progress.offsetWidth);
                var clickTime = (clickPosition * myAudio.duration);

                if (playheadClicked) {
                    e.preventDefault();
                    bar.style.width = Math.floor((((((mousePos - progress.offsetLeft) / progress.offsetWidth) * myAudio.duration) / myAudio.duration) * 100)) + "%";
                    myAudio.currentTime = clickTime;
                }


            });
            $(progress).bind('touchend', function (e) {
                if (!playheadClicked) {

                    e.stopPropagation();
                    e.preventDefault();
                    var clickPosition = ((startCoord - progress.offsetLeft) / progress.offsetWidth);
                    var clickTime = (clickPosition * myAudio.duration);
                    myAudio.currentTime = clickTime;
                    bar.style.width = (((((startCoord - progress.offsetLeft) / progress.offsetWidth) * myAudio.duration) / myAudio.duration) * 100) + "%";
                }
            });
            $(document.documentElement).bind('touchend', function (e) {
                playheadClicked = false;
            });
        }
        else {
            $(document.documentElement).bind('mousemove touchmove', function (e) {
                if (playheadClicked) {

                    var mousePos = Math.floor(e.pageX);
                    e.stopPropagation();
                    e.preventDefault();
                    var clickPosition = ((e.pageX - progress.offsetLeft) / progress.offsetWidth);
                    var clickTime = (clickPosition * myAudio.duration);
                    myAudio.currentTime = clickTime;
                    bar.style.width = (((((mousePos - progress.offsetLeft) / progress.offsetWidth) * myAudio.duration) / myAudio.duration) * 100) + "%";

                }

            });
            $(document.documentElement).bind("mouseup", function (e) {
                playheadClicked = false;
            });
            $(progress).bind("mouseup", function (e) {

                if (!playheadClicked) {
                    // console.log("thisguy");
                    var clickPosition = ((e.pageX - progress.offsetLeft) / progress.offsetWidth);
                    var clickTime = (clickPosition * myAudio.duration);
                    // move the playhead to the correct position
                    myAudio.currentTime = clickTime;
                    bar.style.width = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) + "%";
                    // playheadClicked = false;
                }
            });
        }


//git add . && git commit -m "testing" && git push

    };

    var keyValid = true;
    $(document).on('keydown', function (e) {
        if (e.key === " " && keyValid) {
            keyValid = false;
            $scope.togglePlayback();
            e.preventDefault();
        }
    });

    $(document).on('keyup', function (e) {
        keyValid = true;
    });

}); //End assign9.controller





//Custom filter for the song lengths. As these are not stored as strings, the colon
// must be added manually. Its likely there is a built in angular filter to take care
// of this, but I thought it would be good practice to create a pair of custom filters.
assign9.filter("lengthFilter", function () {

    return function (int) {
        //Simple algorithm to separate the length and add a colon in the appropriate location.
        var str = int.toString();
        var front = str.substring(0, str.length - 2);
        str = str.substring(str.length - 2, str.length);
        return front + ":" + str;
    };
});
assign9.filter("audioFilter", function () {

    return function (i) {

        return "Audio/ " + i + ".mp3";
    };
});
// Another custom filter that calulates the total time. As the total time is saved in
// seconds, a short algorithm is used to calculate the total hours, minutes and remaining
// seconds. Again, this soft of filter is likley to be bulit in to Angular, but it seemed
// like a good thing to practice. 
assign9.filter("timeFilter", function () {
    return function (time) {


        var seconds = time % 60;
        var minutes = (time - seconds) / 60;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        if (minutes >= 60) {
            var hours = Math.floor(minutes / 60);
            minutes = minutes - (hours * 60);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            return hours + "h, " + minutes + "m, " + seconds + "s";
        } else {
            return minutes + ":" + seconds;
        }
    };
});

window.mobileCheck = function () {
    var check = false;
    (function (a, b) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};