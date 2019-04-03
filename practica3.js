"use strict"

var game = function () {
    // Set up an instance of the Quintus engine and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        // Maximize this game to whatever the size of the browser is
        .setup({
            scaleToFit: true,
            width: 1200,
            height: 800
        })
        // And turn on default input controls and touch input (for UI)
        .controls().touch();



    Q.load("mario_small.png, mario_small.json,goomba.png, goomba.json, tiles.png, bloopa.json, bloopa.png, princess.png, mainTitle.png, coin.png, coin.json", function () {
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
                    dead: false,
                    coins: 0
                });

                this.add('2d, platformerControls, animation');
                this.on("bump.left,bump.right", function (collision) {
                    if (collision.tile == 41 || collision.tile == 34 || collision.tile == 27) {
                        this.coins++;
                        console.log(collision.obj);
                        collision.obj.destroy();
                    }
                });

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
                            this.p.dead = true;
                            Q.stageScene("endGame", 1, {
                                label: "You Died"
                            });
                        }
                    } else if (this.p.vx > 0 && this.p.vy == 0) {
                        this.play("run_right");
                    } else if (this.p.vx < 0 && this.p.vy == 0) {
                        this.play("run_left");
                    } else {
                        this.play("stand_" + this.p.direction);
                    }
                } else {
                    this.p.vx = 0;
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

                    if (collision.obj.isA("Player") && !collision.obj.p.dead) {
                        collision.obj.play("die");
                        collision.obj.p.dead = true;
                        collision.obj.p.vy = -500;
                        collision.obj.del("platformerControls");
                        Q.stageScene("endGame", 1, {
                            label: "You Died"
                        });

                        //collision.obj.destroy();
                    }
                });
                // If the enemy gets hit on the top, destroy it
                // and give the user a "hop"
                this.on("bump.top", function (collision) {
                    if (collision.obj.isA("Player") && !collision.obj.p.dead) {
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
                    if (collision.obj.isA("Player") && !collision.obj.p.dead) {
                        collision.obj.play("die");
                        collision.obj.p.dead = true;
                        collision.obj.p.vy = -500;
                        collision.obj.del("platformerControls");
                        Q.stageScene("endGame", 1, {
                            label: "You Died"
                        });
                    }
                });
                // If the enemy gets hit on the top, destroy it
                // and give the user a "hop"
                this.on("bump.top", function (collision) {
                    if (collision.obj.isA("Player") && !collision.obj.p.dead) {
                        this.destroy();
                        collision.obj.p.vy = -300;
                    }
                });

            },

            step: function (dt) {
                if (this.p.y >= 518 && this.p.move != 'up')
                    this.p.move = 'up';
                if (this.p.move == 'up' && this.p.y <= 330)
                    this.p.move = '';
                if (this.p.move == 'up')
                    this.p.vy = -100;
                this.p.y += this.p.vy * dt;

            }
        });
        Q.compileSheets("princess.png");
        Q.Sprite.extend("Princess", {
            init: function (p) {
                this._super(p, {
                    asset: "princess.png",
                    x: 2017,
                    y: 460
                });
                this.add('2d');
                this.on("bump.left,bump.right,bump.bottom,bump.top", function (collision) {
                    if (collision.obj.isA("Player") && !collision.obj.p.dead) {
                        Q.stageScene("winGame", 1, {
                            label: "You just got friendzoned <3"
                        });
                    }
                });
            },
            step: function (dt) {}
        });
        Q.compileSheets("coin.png", "coin.json");
        Q.Sprite.extend("Coin", {
            init: function (p) {
                this._super(p, {
                    sheet: "coin",
                    x: p.x,
                    y: p.y,
                    sensor: true,
                    gravity: 0,
                    frame: 0,
                    hit: false
                });
                this.add('2d, animation, tween');
                this.on("bump.left,bump.right,bump.bottom,bump.top", function (collision) {
                    if (collision.obj.isA("Player") && !collision.obj.p.dead) {
                        if (!this.p.hit) {
                            this.p.hit = true;
                            this.animate({
                                    x: this.p.x,
                                    y: this.p.y - 100
                                },
                                1, Q.Easing.Quadratic.Linear, {
                                    callback: () => {
                                        this.destroy();
                                        Q.state.inc("score", 1);
                                    }
                                });
                        }
                    }
                });
            }
        })
        //************************************** */
        Q.scene("endGame", function (stage) {
            var container = stage.insert(new Q.UI.Container({
                x: Q.width / 2,
                y: Q.height / 2,
                fill: "rgba(0,0,0,0.5)"
            }));

            var button = container.insert(new Q.UI.Button({
                x: 0,
                y: 0,
                fill: "#CCCCCC",
                label: "Play Again"
            }));

            var label = container.insert(new Q.UI.Text({
                x: 10,
                y: -10 - button.p.h,
                label: stage.options.label
            }));

            button.on("click", function () {
                Q.clearStages();
                Q.stageScene('level1');
            });

            container.fit(20);
        });

        Q.scene("winGame", function (stage) {
            var container = stage.insert(new Q.UI.Container({
                x: Q.width / 2,
                y: Q.height / 2,
                fill: "rgba(0,0,0,0.5)"
            }));

            var button = container.insert(new Q.UI.Button({
                x: 0,
                y: 0,
                fill: "#CCCCCC",
                label: "Play Again"
            }));

            var label = container.insert(new Q.UI.Text({
                x: 10,
                y: -10 - button.p.h,
                label: stage.options.label
            }));

            button.on("click", function () {
                Q.clearStages();
                Q.stageScene('level1');
            });

            container.fit(20);
        });
        Q.compileSheets("mainTitle.png");

        Q.scene("mainTitle", function (stage) {
            var container = stage.insert(new Q.UI.Container({
                x: Q.width / 2,
                y: Q.height / 2,
                w: Q.width,
                h: Q.height,
                fill: "rgba(0,0,0,0.5)"
            }));

            var button = container.insert(new Q.UI.Button({
                asset: 'mainTitle.png',
                x: 0,
                y: 0,
                fill: "#CCCCCC",
            }));

            button.on("click", function () {
                Q.clearStages();
                Q.stageScene('level1');
            });

            container.fit(20);
        });
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
            stage.insert(new Q.Princess());
            stage.insert(new Q.Coin({
                x: 270,
                y: 450
            }));
            stage.insert(new Q.Coin({
                x: 300,
                y: 450
            }));
            stage.insert(new Q.Coin({
                x: 330,
                y: 450
            }));

            stage.insert(new Q.Coin({
                x: 470,
                y: 450
            }));
            stage.insert(new Q.Coin({
                x: 500,
                y: 450
            }));
            stage.insert(new Q.Coin({
                x: 530,
                y: 450
            }));
            stage.insert(new Q.Score());

        });
        Q.UI.Text.extend("Score", {
            init: function (p) {
                this._super({
                    label: "score: 0",
                    x: 0,
                    y: 0
                });
                Q.state.on("change.score", this, "score");
            },
            score: function (score) {
                this.p.label = "score: " + score;
            }
        });
        Q.loadTMX("level.tmx", function () {
            Q.state.reset({
                score: 0
            });
            Q.stageScene("mainTitle");
        });

    });

}