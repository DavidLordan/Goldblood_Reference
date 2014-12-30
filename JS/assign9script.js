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

var ballOffset = 23;

// An array of the two songs which are currently swappable. 
var selected = [];

//AngularJS controller. 
assign9.controller("assign9Ctrl", function ($scope, $http) {

//Fetches the song list, stored in a JSON file, via AJAX
    $http.get('JSON/GB_songs.json').success(function (data) {

        $scope.myList = data;
    });
    // An array of the list of song currently in the setlit. 
    // $scope.myList = [];

    // The next position of the song to be added. Also used to determine the number of songs
    // in the list. 
    $scope.nextPos = 0;
    $scope.playing = false;
    $scope.playbackIcon = "Resources/playIcon.png";
    $scope.audioActive = "";
    /**
     * Function to ammend the set list by adding or removing a song.
     * @param {JSON object} newSong - The new song to be added and its information.
     * @param {boolean} value - The value of the check-box calling the function. Used to determine
     *                         if a song is being added or removed. 
     */
    $scope.change = function (newSong, value) {

        //If the check-box is selected, a song is being added.
        if (value) {
            //Increments the song counter and uses the value to set the new song's position.
            $scope.nextPos++;
            newSong.pos = $scope.nextPos;
            // Adds the new song to the setlist
            $scope.myList.push(newSong);
            // As the song lengths are not stord in a easy to interpret format, some
            // parsing must be done. Song lenghts are converted total seconds and added to the total time. 
            var str = newSong.Length.toString();
            var front = str.substring(0, str.length - 2);
            str = str.substring(str.length - 2, str.length);
            total = total + front * 60 + parseInt(str);
            $scope.totalTime = total;
        }
        // Song is being removed.
        else {
            // If the active song is removed, the 'moveActive' variable is cleared. 
            if (newSong === $scope.moveActive) {
                $scope.moveActive = "";
            }

            // Decrements the song counter and saves the index of the song to be deleated.
            $scope.nextPos--;
            var index = $scope.myList.indexOf(newSong);
            // If a swappable song is removed, it is removed from the swappable array.
            for (var i = 0; i < selected.length; i++) {
                if (newSong === selected[i]) {
                    selected.splice(i, 1);
                }
            }

            // The song calling the function is removed from the setlist array. The length
            // of the song is calculated in total seconds and subtracted from the total length. 
            $scope.myList.splice(index, 1);
            var str = newSong.Length.toString();
            var front = str.substring(0, str.length - 2);
            str = str.substring(str.length - 2, str.length);
            total = total - front * 60 - parseInt(str);
            $scope.totalTime = total;
            // Ensures that the other song's positions are properly realigned to reflect
            // the change. 
            for (var i = 0; i < $scope.myList.length; i++) {
                if ($scope.myList[i].pos > newSong.pos) {
                    $scope.myList[i].pos--;
                }
            }
        }
    }; //End change() function.

    // Function what allows the 'moveActive' song to be moved up the setlist. 
    $scope.moveUp = function () {

        // Ensures that there is an active song and clears any error messages.
        if ($scope.moveActive) {
            $scope.error = "";
            // Index of song above song being moved. 
            var posToSave;
            // Ensures that the highest song in the order is not being moved up. 
            if ($scope.moveActive.pos !== 1) {

                //Finds the song just above the moving song in the order. As the play priority
                //in the setlist are independent of the song's position in the setlist array, the only
                // way to find the appropriate song is to iterate accross the list.
                for (var i = 0; i < $scope.myList.length; i++) {
                    if ($scope.myList[i].pos === ($scope.moveActive.pos - 1)) {

                        //Saves te index of the next song in the list.
                        posToSave = i;
                    }
                }

                //Moves the song up the list by decrementing it's position (1 is highest play priority).
                $scope.moveActive.pos--;
                //Moves the next song on the list down one spot, swapping the two. 
                $scope.myList[posToSave].pos++;
            }
        }
        //If no song is currently set to moveActive, an error message is displayed.
        else {
            $scope.error = "Use a radio button to select a song to move.";
        }
    }; //End moveUp() function.


    //Function to move a song down the setlist. This is essentially the same algorithm of
    // the 'moveUp()' function.
    $scope.moveDown = function () {

        if ($scope.moveActive) {
            $scope.error = "";
            var posToSave;
            if ($scope.moveActive.pos !== $scope.myList.length) {

                for (var i = 0; i < $scope.myList.length; i++) {
                    if ($scope.myList[i].pos === ($scope.moveActive.pos + 1)) {
                        posToSave = i;
                    }
                }
                $scope.moveActive.pos++;
                $scope.myList[posToSave].pos--;
            }
        } else {
            $scope.error = "Use a radio button to select a song to move.";
        }
    }; //End moveDown() function.


    //Function that sets selected songs to be swappable. Only two songs may be swappable
    // at a time. 
    $scope.setSwapClass = function (currentClass, selSong) {

        //Clears any error messages if a user tries to select a song.
        $scope.error = "";
        var retVal;
        //If the current song is already active, it is removed from the selected array and
        // it's active class is removed.
        if (currentClass === "active") {

            //Iterates over the 2 members of the selected array to find the matching song.
            for (var i = 0; i < selected.length; i++) {
                if (selected[i] === selSong) {
                    //Removes the matching song from the selected array. 
                    selected.splice(i, 1);
                }
            }
            //Removes the active class.
            retVal = "";
        }

        //If the selected song is not currently active, the number of active songs is checked.
        else {

            //If there are not currently 2 active songs, the new active song is valid and
            // it is added to the selected array with the active class added.
            if (selected.length < 2) {
                selected.push(selSong);
                retVal = "active";
            }
            //If the user is attempting to add a third swappable song, an error message is displayed.
            else {
                $scope.error = "Only 2 songs may be selected at a time for swapping.";
            }
        }

        //Returns the new class for to selected song.
        return retVal;
    }; //End setSwapClass() function

    //The movable song is updated when the corresponding radio box is clicked.
    $scope.updateActive = function (i) {

        myAudio = document.getElementById('my-audio');
        $scope.playbackIcon = "Resources/playIcon.png";
        myAudio.pause();
        $scope.playing = false;
        if (myAudio.currentTime !== 0) {

            myAudio.currentTime = 0;
            var bar = document.getElementById('bar');
            bar.style.width = 0;
            $("#circle1").css({'left': ballOffset + 'px'});
        }

        if ($scope.moveActive !== i) {
            $scope.moveActive = i;
            $scope.audioActive = $scope.moveActive.name;
        }
        else {
            $scope.moveActive = "";
            $scope.audioActive = "";
        }

    };
    // If there are two swappable songs, a simple swap algorithm is used to trade their
    // positions. 
    $scope.swap = function () {

        if (selected.length === 2) {
            var temp = selected[0].pos;
            selected[0].pos = selected[1].pos;
            selected[1].pos = temp;
        }
        //If the user attempts to swap 0 or 1 songs, an error message is displayed. 
        else {
            $scope.error = "Please select up to 2 songs to swap.";
        }
    }; //End swap() function.

    $scope.togglePlayback = function () {

        //console.log("woah");
        var myAudio = document.getElementById('my-audio');
        if ($scope.audioActive !== "") {

            if ($scope.playing) {
                $scope.playing = false;
                $scope.playbackIcon = "Resources/playIcon.png";
                //$scope.$apply();
                myAudio.pause();
            }
            else {

                $scope.playing = true;
                $scope.playbackIcon = "Resources/pauseIcon.png";
                myAudio.play();
            }

        }

    };



    //Loads the finished list of songs
    $scope.finishedList = function () {

        //Fetches the song list, stored in a JSON file, via AJAX
        $http.get('JSON/GB_songs.json').success(function (data) {

            $scope.myList = data;
        });

    };



    //Loads the unfinished list of songs
    $scope.unfinishedList = function () {


//Fetches the song list, stored in a JSON file, via AJAX
        $http.get('JSON/GB_ideas.json').success(function (data) {

            $scope.myList = data;
        });
    };






    $scope.load = function () {

        var myAudio = document.getElementById('my-audio');
        var bar = document.getElementById('bar');
        var ball = document.getElementById('circle1');
        var playerScale = 259;
        var ballLeft = 0;
        
        
        if ($(window).width() > 1024) {
            playerScale = 465;
            ballOffset = 18;
        } else {
            playerScale = 259;
            ballOffset = 23;
        }



        window.addEventListener("resize", function () {



            if ($(window).width() > 1024) {
                playerScale = 465;
                ballOffset = 18;
                console.log("duuude");
            } else {
                playerScale = 255;
                ballOffset = 23;
            }

            ballLeft = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) / 100;
            ballLeft = playerScale * ballLeft + ballOffset;
            $(ball).css({'left': ballLeft + 'px'});
            
        });
        $(ball).css({'left': ballOffset + 'px'});
        myAudio.addEventListener("ended", function () {
            $scope.playbackIcon = "Resources/playIcon.png";
            $scope.$apply();
            $scope.togglePlayback();
            this.currentTime = 0;
        });
        myAudio.addEventListener('timeupdate', function () {
            console.log("update");
            bar.style.width = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) + "%";
            ballLeft = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) / 100;
            ballLeft = playerScale * ballLeft + ballOffset;
            $(ball).css({'left': ballLeft + 'px'});
        });
        var progress = document.getElementById('progress');
        progress.addEventListener('click', function (e) {

            // calculate the normalized position clicked
            var clickPosition = (e.pageX - this.offsetLeft - 15) / this.offsetWidth;
            var clickTime = (clickPosition * myAudio.duration);
            // move the playhead to the correct position
            myAudio.currentTime = clickTime;
            bar.style.width = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) + "%";
            ballLeft = parseInt(((myAudio.currentTime / myAudio.duration) * 100), 10) / 100;
            ballLeft = playerScale * ballLeft + ballOffset;
            $(ball).css({'left': ballLeft + 'px'});
        });
    };
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
            return minutes + "m, " + seconds + "s";
        }
    };
});

