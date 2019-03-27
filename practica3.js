"use strict"

var game = function () {
    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        // Maximize this game to whatever the size of the browser is
        .setup({
            maximize: true,
            width: 800,
            height: 700
        })
        // And turn on default input controls and touch input (for UI)
        .controls().touch();


    Q.load("mario_small.png, mario_small.json,goomba.png, goomba.json, tiles.png,bloopa.json, bloopa.png", function () {
        // Sprites sheets can be created manually
        Q.sheet("tiles", "tiles.png", {
            tilew: 32,
            tileh: 32
        });
        // Or from a .json asset that defines sprite locations
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.animations('player_anim', {
            run_right: {
                frames: [1, 2, 3],
                rate: 1 / 15
            },
            run_left: {
                frames: [15, 16, 17],
                rate: 1 / 15
            },
            stand_right: {
                frames: [0],
                rate: 1 / 5
            },
            stand_left: {
                frames: [14],
                rate: 1 / 5
            },
            jump_right: {
                frames: [4],
                rate: 1 / 15
            },
            jump_left: {
                frames: [18],
                rate: 1 / 15
            },
            fall_right: {
                frames: [6],
                rate: 1 / 30,
                loop: false
            },
            fall_left: {
                frames: [20],
                rate: 1 / 30,
                loop: false
            },
            die: {
                frames: [12],
                rate: 1 / 5
            }
        });
        Q.Sprite.extend("Player", {

            init: function (p) {

                this._super(p, {
                    sprite: "player_anim",
                    sheet: "marioR", // Setting a sprite sheet sets sprite width and height
                    x: 50, // You can also set additional properties that can
                    y: 380, // be overridden on object creation
                    dead: false
                });

                this.add('2d, platformerControls, animation');

            },
            step: function (dt) {
                if (!this.p.dead) {
                    if (this.p.vy < 0) { //jump
                        this.p.y -= 2;
                        this.play("jump_" + this.p.direction);
                    } else if (this.p.vy > 0) {
                        this.play("fall_" + this.p.direction);
                        //if dies
                        if (this.p.y > 580) {
                            this.play("die");
                            this.del("2d");
                        }
                    } else if (this.p.vx > 0 && this.p.vy == 0) {
                        this.play("run_right");
                    } else if (this.p.vx < 0 && this.p.vy == 0) {
                        this.play("run_left");
                    } else {
                        this.play("stand_" + this.p.direction);
                    }
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
                    
                    if (collision.obj.isA("Player") && !collision.obj.p.dead ) {
                        collision.obj.play("die");
                        collision.obj.p.dead = true;
                        collision.obj.p.vy = -500;
                        Q.stageScene("endGame", 1, {
                            label: "You Died"
                        });
                        
                        //collision.obj.destroy();
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

            step: function (dt) {}
        });
        //***************************************
        Q.compileSheets("bloopa.png", "bloopa.json");

        Q.Sprite.extend("Bloopa", {

            init: function (p) {

                this._super(p, {
                    sheet: "bloopa", // Setting a sprite sheet sets sprite width and height
                    x: 180, // You can also set additional properties that can
                    y: 425, // be overridden on object creation
                    vy: -10,
                    move: ''
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
                if (this.p.y >= 528 && this.p.move != 'up')
                    this.p.move = 'up';
                if (this.p.move == 'up' && this.p.y <= 330)
                    this.p.move = '';
                if (this.p.move == 'up')
                    this.p.vy = -100;
                this.p.y += this.p.vy * dt;

            }
        });

        //************************************** */


        Q.scene("level1", function (stage) {
            Q.stageTMX("level.tmx", stage);
            // Create the player and add them to the stage
            var player = stage.insert(new Q.Player());
            stage.add("viewport").follow(player, {
                x: true,
                y: false
            });
            stage.insert(new Q.Goomba());
            stage.insert(new Q.Bloopa());
        });

        Q.loadTMX("level.tmx", function () {
            Q.stageScene("level1");
        });

    });

}