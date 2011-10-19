var COLUMN_COUNT = 6;

function $(id) {
    return document.getElementById(id);
}

var setObjectProperties = function(obj, props) {
    for(var option in props) {
        if (props.hasOwnProperty(option)) {
            if (typeof props[option] === "object") {
                setObjectProperties(obj[option], props[option]);
            } else {
                obj[option] = props[option];
            }
        }
    }
};

var createElement = function(name, opts) {
    var element = document.createElement(name);
    if (opts !== null) {
        setObjectProperties(element, opts);
    }
    return element;
};

var new_Field = function() {
    var that = {};
    var image = "";
    var container;

    that.covered = function() { return image.style.visibility === "hidden"; };
    that.uncovered = function() { return ! that.covered(); };

    that.onClick = null;

    that.setImage = function(img) {
        image = img;
        container.appendChild(image);
    };

    that.getImage = function() { return image.src; };
    
    var containerClick = function(e) {
        if (that.uncovered()) return;

        if (that.covered()) {
            that.uncover();
        } else { that.cover(); }

        if (that.onClick) { that.onClick(e); }
    };

    that.setContainer = function(c) {
        container = c;
        container.addEventListener("click", containerClick, false);
    };

    that.equals = function(f) {
        return that.getImage() === f.getImage();
    };

    that.cover = function() { 
        image.style.visibility = "hidden";
        container.style.backgroundImage = "url(png/cover.png)";
    };

    that.uncover = function() { 
        image.style.visibility = "visible";
        container.style.backgroundImage = "url(png/uncover.png)";
    };

    that.remove = function() {
        container.style.backgroundImage = "none";
        image.style.visibility = "hidden";
        container.removeEventListener("click", containerClick, false);
    };

    return that;
};

var new_Board = function(id) {
    var that = {};
    board = $(id);
    fields = [];
    row = createElement("div");
    board.appendChild(row);

    that.addField = function(img) {
        var field = new_Field();
        var fieldContainer = createElement("div", { className: "field" });
        var fieldImage = createElement("img", { src: img, style: { visibility: "hidden" } });

        field.setContainer(fieldContainer);
        field.setImage(fieldImage);

        if (fields.length % COLUMN_COUNT === 0 && fields.length > 0) {
            row = createElement("div");
            board.appendChild(row);
        }

        row.appendChild(fieldContainer);

        fields.push(field);
        return field;
    };

    return that;
};


function shuffle(arr) {
    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}

function startClock() {
    var time = 1;

    return function() {
        var min = Math.floor(time / 60);
        var sec = time % 60;
        if (sec < 10) { sec = "0" + sec; }

        $("time").innerHTML = min > 0 ? min + ":" + sec : sec;
        time += 1;
    };
}

function resetGame() {
    $("board").innerHTML = "";
    $("time").innerHTML = "0";
    $("pairs").innerHTML = "12";
    $("moves").innerHTML = "0";
    $("status").innerHTML = "";
}

function onLoad() {
    var b = new_Board("board");
    var images = [];
    var uncovered = [];
    var pairs = 12;
    var moves = 0;
    var timeout;
    var removeTimeout = null;
    var clockIntervalId = null;

    for(var i=0; i<12; ++i) { images.push("png/" + i + ".png"); }
    images = images.concat(images);
    shuffle(images);

    var deleteGuessed = function(guessed) {
        guessed.forEach(function(el) { el.remove(); });
        removeTimeout = null;
        uncovered = [];
    };

    images.forEach(function(el, i) {
        var field = b.addField(el);

        field.onClick = function(e) {
            if (moves === 0) {
                var tick = startClock();
                clockIntervalId = window.setInterval(tick, 1000, time);
            }

            if (removeTimeout) {
                clearTimeout(removeTimeout);
                deleteGuessed(uncovered);
            }

            if (e) { 
                moves += 1;
                $("moves").innerHTML = moves;
            }

            if (uncovered.length < 2) {
                field.uncover();
                uncovered.push(field);

                if (uncovered.length === 2) {
                    if (field.equals(uncovered[0])) {
                        // takie same ;)
                        pairs -= 1;
                        if (pairs === 0) {
                            clearTimeout(clockIntervalId);

                            $("status").innerHTML = "<b>You've won! :)</b> |";
                            var a = createElement("a", { 
                                text: "Play again", 
                                href: "#"
                            });

                            a.addEventListener("click", function() {
                                resetGame();
                                onLoad();
                            }, false);

                            $("status").appendChild(a);
                        }

                        $("pairs").innerHTML = pairs;

                        removeTimeout = setTimeout(deleteGuessed, 2000, uncovered);
                    } else {
                        timeout = setTimeout(function() { field.onClick(); }, 2000);
                    }
                }
            } else {
                clearTimeout(timeout);
                uncovered.forEach(function(el, i) { el.cover(); });
                uncovered = e ? [field] : []; 
            }
        };
    });

}

document.addEventListener("DOMContentLoaded", onLoad, false);
