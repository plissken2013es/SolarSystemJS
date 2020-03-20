SolarSystem = {
    Defaults: {
        width:      800,
        height:     800
    },
    
    Colors: [
        "rgb(31, 119, 180)",    "rgb(155, 213, 138)",
        "rgb(140, 86, 75)",     "rgb(199, 199, 199)",
        "rgb(174, 199, 232)",   "rgb(214, 39, 40)",
        "rgb(196, 156, 148)",   "rgb(188, 189, 34)",
        "rgb(255, 127, 14)",    "rgb(255, 152, 150)",
        "rgb(148, 103, 189)",   "rgb(158, 218, 229)"
    ],
    
    Images: [
        "img/planets.png",
        "img/sky.png",
        "img/sun.png",
        "img/sunRays.png",
        "img/moon.png",
        "img/shipSprite80x40.png"
    ],
    
    Planets: [
        { 
            name: 'Selene', 
            spritePos: 0,
            radius: 14
        }, 
        { 
            name: 'Mimas', 
            spritePos: 26,
            radius: 15
        }, 
        { 
            name: 'Ares', 
            spritePos: 52,
            radius: 16
        }, 
        { 
            name: 'Enceladus', 
            spritePos: 78,
            radius: 17
        }, 
        { 
            name: 'Tethys', 
            spritePos: 104,
            radius: 18
        }, 
        { 
            name: 'Dione', 
            spritePos: 130,
            radius: 17
        }, 
        { 
            name: 'Zeus', 
            spritePos: 156,
            radius: 17
        }, 
        { 
            name: 'Rhea', 
            spritePos: 182,
            radius: 17
        }, 
        { 
            name: 'Titan', 
            spritePos: 208,
            radius: 18
        }, 
        { 
            name: 'Janus', 
            spritePos: 234,
            radius: 19
        }, 
        { 
            name: 'Hyperion', 
            spritePos: 260,
            radius: 21
        }, 
        { 
            name: 'Iapetus', 
            spritePos: 286,
            radius: 22
        }
    ],
    
    initialize: function(runner, cfg) {
        Game.loadImages(SolarSystem.Images, function(images) {
            this.cfg        = cfg;
            this.runner     = runner;
            this.width      = runner.width;
            this.height     = runner.height;
            this.center     =  { x: this.width/2, y: this.height/2 };
            this.images     = images;
            
            this.dtAvg      = NaN;
            this.touchPos   = {x:0, y:0};
            
            this.planets    = this.createPlanets();
            this.ship       = Object.construct(SolarSystem.Ship, {x: 50, y: 50}, this);
            this.trails     = [Object.construct(SolarSystem.Trail, this.center, this.center, 250, this)]; 
            // dummy trail to intialize the array, to prevent some weird "bug" that i need to find
            
            this.runner.start(); 
        }.bind(this));
    },
    
    update: function(dt) {
        var time = new Date();
        this.s = ((2*Math.PI)/6)*time.getSeconds();
        this.m = ((2*Math.PI)/6000)*time.getMilliseconds();
        
        this.sunAlpha = Game.randomInt(30, 50) / 100;
        
        if (isNaN(this.dtAvg)) {
            this.dtAvg = dt;
        } else {
            this.dtAvg = (this.dtAvg + dt) / 2;
        }
        
        for (var i=this.trails.length-1; i>0; i--) {
            this.trails[i].update(dt);
            if (this.trails[i].done) {
                delete this.trails[i];
                this.trails.splice(i, 1);
            }
        }
        
        for (var l=this.planets.length, i=l-1; i-->0; ) {  
            this.planets[i].update(dt);
        }
        
        this.ship.update(dt);
    },
    
    draw: function(ctx) {
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawSky(ctx);
        this.drawSun(ctx);
        this.drawPlanets(ctx);
        this.drawTrails(ctx);
        this.ship.draw(ctx);
    },
    
    drawPlanets: function(ctx) {
        ctx.save();
            ctx.font = "12px Arial, sans";
            if (!this.grad) {
                this.grad = ctx.createLinearGradient(0, 0, 75, 0);
                this.grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
                this.grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
            }

            ctx.translate(this.width/2, this.height/2);
            for (var l=this.planets.length, i=l-1; i-->0; ) {  
                this.planets[i].draw(ctx);
            }
        ctx.restore();
    },
    
    drawSky: function(ctx) {
        ctx.drawImage(this.images["img/sky.png"], 0, 0);
    },
    
    drawSun: function(ctx) {
        ctx.save();
        ctx.translate(this.width/2, this.height/2);
        ctx.rotate((this.m+this.s)/10);
        ctx.drawImage(this.images["img/sun.png"], -50, -50);
        ctx.globalAlpha = this.sunAlpha;
        ctx.drawImage(this.images["img/sunRays.png"], -150, -150);
        ctx.restore();
    },
    
    drawTrails: function(ctx) {
        for (var i=0, l=this.trails.length; i<l; i++) {
            this.trails[i].draw(ctx);
        }
    },
    
    checkMouseRadius: function(planetOrbit) {
        if (isNaN(this.mouseRadius) || this.mouseRadius <= planetOrbit - 13 || this.mouseRadius >= planetOrbit + 13) {
            return false;
        }
        return true;
    },
    
    createMoons: function() {
        var numMoons = Game.randomInt(0, 2);
        var moons = [];
        for (var i=0; i<numMoons; i++) {
            moons[i] = {
                orbit: 8.5 + (4 * (i+1)),
                rotation: Game.randomChoice(-1, 1) / Game.random(0.3, 0.7)
            };
        }
        return moons;
    },
        
    createPlanets: function() {
        var planets = [], p;
        
        for (var i=0, l=SolarSystem.Planets.length; i<l; i++) {
            p = Object.construct(SolarSystem.Planet, 
                                 50 + (26 * i) + Game.randomInt(0, 15), 
                                 SolarSystem.Planets[i].spritePos, 
                                 i + ". " + SolarSystem.Planets[i].name,
                                 SolarSystem.Planets[i].radius,
                                 this);
            planets.push(p);
        }
        
        return planets;
    },
    
    findPlanetByHover: function() {
        for (var q=0, l=this.planets.length; q<l; q++) {
            if (this.planets[q].active) {
                //return Object.extend({}, this.planets[q]); // planet object copy
                return this.planets[q]; // at last, it's best to pass it by reference
            }
        }
        return null;
    },
    
    onmousemove: function(pos, evt) {
        this.mouseRadius = this.Helper.distance(pos, this.center);
        this.touchPos = pos;
    },
    
    onmousedown: function(pos, evt) {        
        var planet = this.findPlanetByHover();
        if (planet === null) {
            this.ship.destination.x = pos.x;
            this.ship.destination.y = pos.y;
            this.ship.planetDestination = null;
        } else {         
            this.ship.destination = this.Helper.rad2xy(this.center, planet.orbit, planet.currentRotation);
            this.ship.planetDestination = planet;
        }
        var eta = this.ship.calculateETA(this.dtAvg);
        
        if (planet !== null) {
            // we've got the eta to the planet's current position, but
            // where it will be when this time has passed?
            var time = new Date();
            var futureTimeMs = (time.valueOf() + (eta * this.dtAvg * 1000 | 0));
            var futureTime = new Date(futureTimeMs);

            var cs = ((2*Math.PI)/6) * time.getSeconds();
            var cm = ((2*Math.PI)/6000) * time.getMilliseconds();
            var fs = ((2*Math.PI)/6) * futureTime.getSeconds();
            var fm = ((2*Math.PI)/6000) * futureTime.getMilliseconds();
            var futureRotation = planet.currentRotation / (cs + cm + planet.random) * (fs + fm + planet.random);
            // let's try our luck!
            this.ship.destination.x = this.width/2 + (planet.orbit * Math.cos(futureRotation));
            this.ship.destination.y = this.height/2 + (planet.orbit * Math.sin(futureRotation));
        
            // calculate the new eta
            eta = this.ship.calculateETA(this.dtAvg);
        }
        
        var trailStart = { x: this.ship.pos.x, y: this.ship.pos.y };
        var trailEnd = { x: this.ship.destination.x, y: this.ship.destination.y };
        var trail = Object.construct(SolarSystem.Trail, trailStart, trailEnd, eta, this);
        this.trails.push(trail);
        
        this.ship.initTimer(trail.angle);
    },
    
    ontouchstart: function(pos, ev) {
        this.onmousemove(pos, null);
    },
    
    ontouchend: function() {
        this.onmousedown(this.Helper.rad2xy(this.center, this.mouseRadius, this.Helper.angle(this.center, this.touchPos)), null);
    },
    
    Planet: {
        initialize: function(orbit, spritePos, name, radius, game) {
            this.orbit          = orbit;
            this.spritePos      = spritePos;
            this.name           = name;
            this.radius         = radius;
            this.game           = game;
            this.random         = Math.random() * 2 * Math.PI * 2;
            this.direction      = Game.randomChoice(-1, 1);
            this.rotationDir    = Game.randomChoice(-1, 1) / Game.random(1.35, 1.65);
            this.active         = false;
            this.moons          = game.createMoons();
        },
        
        draw: function(ctx) {
                // draw orbit
                ctx.strokeStyle = SolarSystem.Colors[this.radius-13];
                if (this.mouseInOrbit) {
                    ctx.lineWidth = 3;
                    this.active = true;
                } else {
                    ctx.lineWidth = 1;
                    this.active = false;
                }
                ctx.beginPath();
                ctx.arc(0, 0, this.orbit, 0, Math.PI*2, false);
                ctx.stroke();


                ctx.save();
                    var planetRotation = (this.game.s+this.game.m+this.random)/(this.radius-13)*this.direction;
                    this.currentRotation = planetRotation;
                    ctx.rotate(planetRotation);
                    ctx.translate(this.orbit, 0);

                    // draw planet rotating over its own axis
                    ctx.save();
                        ctx.rotate((this.game.s+this.game.m)*this.rotationDir); 
                        ctx.drawImage(this.game.images["img/planets.png"], 
                                      this.spritePos, 0, 
                                      26, 26, 
                                      -13, -13,
                                      26, 26);
                    ctx.restore();
                
                    // draw moons, if it has any
                    var moons = this.moons;
                    for (var q=0; q<moons.length; q++) {
                        ctx.save();
                        ctx.rotate(moons[q].rotation * (this.game.m + this.game.s));
                        ctx.translate(0, moons[q].orbit);
                        ctx.drawImage(this.game.images["img/moon.png"], -3.5, -3.5);
                        ctx.restore();
                    }

                    // draw shadow
                    ctx.fillStyle = this.game.grad;
                    ctx.strokeStyle = "rgba(0, 153, 255, 0.4";
                    var tempRadius = this.radius;
                    ctx.fillRect(tempRadius*0.0125, -tempRadius/2, 75, tempRadius);
                
                    // draw planet name, if proceed
                    if (this.mouseInOrbit) {                
                        ctx.rotate(-planetRotation);
                        ctx.fillStyle = "white";
                        ctx.fillText(this.name, 7, -7);
                    }
                
                ctx.restore();        
        },
        
        update: function(dt) {
            this.mouseInOrbit = this.game.checkMouseRadius(this.orbit);
        }
    },
    
    Ship: {
        initialize: function(pos, game) {
            this.game               = game;
            this.pos                = pos;
            this.destination        = {x: pos.x, y: pos.y};
            this.isTravelling       = false;
            this.orbitingPlanet     = false;
            
            this.FRICTION           = 0.35;
            this.CONSIDER_ARRIVED   = 25;
            this.CONSIDER_ORBITING  = 50;
            
            this.sprite             = new Sprite(this.game.images["img/shipSprite80x40.png"], [0, 0], [20, 40], 16, [0, 1, 2, 3]);
            this.angle              = Math.PI * 0.75;
            this.orbitCounter       = 0;
        },
        
        draw: function(ctx) {
            ctx.save();
                if (this.isEnteringOrbit) {
                    ctx.translate(this.pos.x, this.pos.y);
                    ctx.rotate(this.angle);
                    ctx.scale(this.scale, this.scale);
                } else if (this.isOrbiting) {
                    ctx.translate(this.game.width/2, this.game.height/2);
                    ctx.rotate(this.planetDestination.currentRotation);
                    ctx.translate(this.planetDestination.orbit, 0);
                    ctx.rotate(this.orbitCounter);
                    ctx.translate(this.orbit, 0);
                    ctx.scale(this.scale, this.scale);
                } else {
                    ctx.translate(this.pos.x, this.pos.y);
                    ctx.rotate(this.angle);
                }
                ctx.translate(-this.sprite.size[0]/2, -this.sprite.size[1]/2);
                this.sprite.render(ctx);
            ctx.restore();
        },
        
        update: function(dt) {
            if (this.isEnteringOrbit) {
                this.orbitCounter++;
                this.scale = 1 - this.orbitCounter / 10;
                    
                if (this.scale <= 0.25) {
                    this.isEnteringOrbit = false;
                    this.isOrbiting = true;
                    this.scale = 0.5;
                    var currentPlanetPos = this.game.Helper.rad2xy(this.game.center, this.planetDestination.orbit, this.planetDestination.currentRotation);
                    var distanceToPlanet = this.game.Helper.distance(currentPlanetPos, this.pos); 
                    this.orbit = distanceToPlanet; 
                    var angleToPlanet = this.game.Helper.xy2rad(this.pos, currentPlanetPos).angle;
                    this.orbitCounter = angleToPlanet + (2*Math.PI);
                }
            } else if (this.isOrbiting) {
                this.orbitCounter += Math.PI / 50;
                var currentPlanetPosX = this.game.width/2 + (this.planetDestination.orbit * Math.cos(this.planetDestination.currentRotation));
                var currentPlanetPosY = this.game.height/2 + (this.planetDestination.orbit * Math.sin(this.planetDestination.currentRotation));  
                this.pos.x = currentPlanetPosX;
                this.pos.y = currentPlanetPosY;
            } else {
                // we're travelling through infinite space!!
                var velX = (this.destination.x - this.pos.x) / this.FRICTION * dt;
                var velY = (this.destination.y - this.pos.y) / this.FRICTION * dt;

                this.pos.x += velX;
                this.pos.y += velY;

                if (this.isTravelling) {
                    var distanceToDestination = this.game.Helper.distance(this.destination, this.pos);
                    if (distanceToDestination < this.CONSIDER_ARRIVED) {
                        this.isTravelling = false;
                        this.endTime = new Date().valueOf();
                        console.log("arrived in ", this.endTime - this.startTime, " miliseconds");
                        this.checkIfOrbitIsEntered();
                    }                    
                }
            }
            
            this.sprite.update(dt);
        },
        
        initTimer: function(angle) {
            this.startTime = new Date().valueOf();
            this.isEnteringOrbit    = false;
            this.isOrbiting         = false;
            this.isTravelling       = true;
            this.scale              = 1;
            this.angle = angle + Math.PI/2;
        },
        
        calculateETA: function(dt) {
            var frames = 0, velX, velY, currentPos = { x: this.pos.x, y: this.pos.y };
            var distanceToDestination = this.game.Helper.distance(this.destination, currentPos);
            
            while (distanceToDestination > this.CONSIDER_ARRIVED) {
                velX = (this.destination.x - currentPos.x) / this.FRICTION * dt;
                velY = (this.destination.y - currentPos.y) / this.FRICTION * dt;
                currentPos.x += velX;
                currentPos.y += velY;
                distanceToDestination = this.game.Helper.distance(this.destination, currentPos);
                frames++;
            }
            
            return frames;
        },
        
        checkIfOrbitIsEntered: function() {
            if (this.planetDestination != null) {
                console.log("should have reached " + this.planetDestination.name);
                
                var currentPlanetPos = this.game.Helper.rad2xy(this.game.center, this.planetDestination.orbit, this.planetDestination.currentRotation);
                var distanceToPlanet = this.game.Helper.distance(currentPlanetPos, this.pos); 
                
                if (distanceToPlanet < this.CONSIDER_ORBITING) {
                    console.log("ou yeah!! we did it!! ", distanceToPlanet);
                    this.isEnteringOrbit = true;
                    // this.orbit = distanceToPlanet * 2; 
                    // must recalculate distance when orbit entrance process has finished
                    this.orbitCounter = 0;
                } else {
                    console.log("bad computer calculations: failed to enter orbit of " + this.planetDestination.name);
                }
            }
        }
    },
    
    Trail: {
        initialize: function(start, end, eta, game) {
            this.game           = game;
            this.start          = { x: start.x, y: start.y };
            this.end            = end;
            this.angle          = this.game.Helper.angle(this.start, this.end);
            this.distance       = this.game.Helper.distance(this.end, this.start);
            this.cosine         = Math.cos(this.angle);
            this.sine           = Math.sin(this.angle);
            this.eta            = eta * game.dtAvg * 1000 | 0;
            this.counter        = 0;
            this.done           = false;
            this.isGrowing      = true;
            this.drawFrom       = { x: start.x, y: start.y };
            this.drawTo         = { x: start.x, y: start.y };
            this.alpha          = 0;
            
            this.PERCENT_TAIL   = 0.55;
        },
        
        update: function(dt) {            
            this.counter += (this.eta - this.counter) / 25;
            
            var dx, dy, k;
            if (this.isGrowing) {
                k = this.distance * this.counter / this.eta;
                dx = k * this.cosine;
                dy = k * this.sine ;
                this.drawTo = { x: this.start.x + dx, y: this.start.y + dy };
                this.alpha = 0.75 * this.counter / this.eta;
            } else {
                k = (this.counter - (this.eta * (1 - this.PERCENT_TAIL))) * this.distance / this.eta;
                dx = k * this.cosine;
                dy = k * this.sine ;
                this.drawFrom  = { x: this.start.x + dx, y: this.start.y + dy };
                this.drawTo = { x: this.drawTo.x + dx/50, y: this.drawTo.y + dy/50 };
                this.alpha = 0.75 * (this.eta - this.counter) / this.eta;
            }
            
            this.isGrowing = this.counter < this.eta * this.PERCENT_TAIL;
            this.done = this.counter > this.eta * 0.95;
        },
        
        draw: function(ctx) {
            if (!this.grad) {
                this.grad = ctx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
                this.grad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
                this.grad.addColorStop(1, "rgba(255, 255, 255, 0.75)");
            }
            
            ctx.strokeStyle = "rgba(255, 255, 255, " + this.alpha + ")"; // this.grad
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.drawFrom.x, this.drawFrom.y);
            ctx.lineTo(this.drawTo.x, this.drawTo.y);
            ctx.stroke();
        }
    },
    
    Helper: {
        rad2xy: function(center, r, angle) {
            return {
                x: center.x + (r * Math.cos(angle)),
                y: center.y + (r * Math.sin(angle))
            };
        },
        
        xy2rad: function(center, coords) {
            return {
                center: center,
                angle: this.angle(coords, center),
                r: this.distance(coords, center)
            };
        },
        
        angle: function(pointB, pointA) {
            return Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
        },
        
        distance: function(pointA, pointB) {
            return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
        }
    }
};