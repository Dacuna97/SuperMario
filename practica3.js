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


    Q.load("mario_small.png, mario_small.json,goomba.png, goomba.json, tiles.png", function () {
        // Sprites sheets can be created manually
        Q.sheet("tiles", "tiles.png", {
            tilew: 32,
            tileh: 32
        });
        // Or from a .json asset that defines sprite locations
        Q.compileSheets("mario_small.png", "mario_small.json","goomba.png","goomba.json");

        Q.Sprite.extend("Player", {

            init: function (p) {

                this._super(p, {
                    sheet: "marioR", // Setting a sprite sheet sets sprite width and height
                    x: 50, // You can also set additional properties that can
                    y: 380 // be overridden on object creation
                });

                this.add('2d, platformerControls');

            },
            step: function (dt) {
                if (this.p.y > 1000) {
                    this.p.x = 150;
                    this.p.y = 380;
                }
            }
        });

        //***************************************
       //  Q.compileSheets("goomba.png", "goomba.json");

        Q.Sprite.extend("Goomba", {

            init: function (p) {

                this._super(p, {
                    sheet: "goomba", // Setting a sprite sheet sets sprite width and height
                    x: 180, // You can also set additional properties that can
                    y: 380, // be overridden on object creation
                    vx:10
                
                });
                this.add('2d,aiBounce');
            },
            step: function (dt) {
                if (this.p.x < 300)
                    this.p.vx = -10;
                if (this.p.x > 400)
                    this.p.vx = 10;
                this.p.x += dt * this.p.vx;

            }
        });
        //***************************************


        Q.scene("level1", function (stage) {
            Q.stageTMX("level.tmx", stage);
            // Create the player and add them to the stage
            var player = stage.insert(new Q.Player());
            stage.add("viewport").follow(player);
            var goomba = stage.insert(new Q.Goomba());
        });

        Q.loadTMX("level.tmx", function () {
            Q.stageScene("level1");
        });

    });

}