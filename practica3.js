"use strict"

var game = function () {
    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Anim")
        // Maximize this game to whatever the size of the browser is
        .setup({
            maximize: true
        })
        // And turn on default input controls and touch input (for UI)
        .controls().touch();


    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load("mario_small.png, mario_small.json, tiles.png", function () {
        // Sprites sheets can be created manually
        Q.sheet("tiles", "tiles.png", {
            tilew: 32,
            tileh: 32
        });
        // Or from a .json asset that defines sprite locations
        Q.compileSheets("mario_small.png", "mario_small.json");

        Q.Sprite.extend("Player", {

            init: function (p) {

                this._super(p, {
                    sheet: "marioR", // Setting a sprite sheet sets sprite width and height
                    x: 150, // You can also set additional properties that can
                    y: 380 // be overridden on object creation
                });

                this.add('2d, platformerControls');

            },
            step: function(dt) {
                if(this.p.y > 1000){
                    this.p.x = 150;
                    this.p.y = 380;
                }
            }
        });

        Q.scene("level1", function (stage) {
            Q.stageTMX("level.tmx", stage);
            // Create the player and add them to the stage
            var player = stage.insert(new Q.Player());
            stage.add("viewport").follow(player);
        });

        Q.loadTMX("level.tmx", function () {
            Q.stageScene("level1");
        });

    });

}