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
        Q.compileSheets("mario_small.png", "mario_small.json");

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
        Q.compileSheets("goomba.png", "goomba.json");

        Q.Sprite.extend("Goomba", {

            init: function (p) {

                this._super(p, {
                    sheet: "goomba", // Setting a sprite sheet sets sprite width and height
                    x: 270, // You can also set additional properties that can
                    y: 528, // be overridden on object creation
                    vx: 40

                });
                this.add('2d,aiBounce');
                this.on("bump.left,bump.right,bump.bottom", function (collision) {
                    if (collision.obj.isA("Player")) {
                        Q.stageScene("endGame", 1, {
                            label: "You Died"
                        });
                        collision.obj.destroy();
                    }
                });
                // If the enemy gets hit on the top, destroy it
                // and give the user a "hop"
                this.on("bump.top", function (collision) {
                    if (collision.obj.isA("Player")) {
                        this.destroy();
                        collision.obj.p.vy = -300;
                    }
                });
                
            },

            step: function (dt) {
            }
        });
        //***************************************


        Q.scene("level1", function (stage) {
            Q.stageTMX("level.tmx", stage);
            // Create the player and add them to the stage
            var player = stage.insert(new Q.Player());
            stage.add("viewport").follow(player);
            stage.insert(new Q.Goomba());
        });

        Q.loadTMX("level.tmx", function () {
            Q.stageScene("level1");
        });

    });

}