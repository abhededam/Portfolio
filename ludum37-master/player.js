/* jshint esversion: 6 */

function Player(x, y) {
    this.pos = POINTS.fromAbs(x, y);
    this.oob = function() {
        let px = 10 * GAME.scale.x;
        let py = 5 * GAME.scale.y;
        return (this.pos.x < px) || (this.pos.x > WIDTH-px) || (this.pos.y < GAME.getBackY()+py) || (this.pos.y > HEIGHT-py);
    };

    this.isHiding = false;

    this.exitHidingPlace = function() {
        if ( !this.isHiding ) {
            return false;
        }
        GAME.pushGameObj(this.sprite);
        guiStage.removeChild(this.blend);
        this.isHiding = false;

        GAME.getCurrentStage().removeChild(GAME.toKill);
        GAME.pushGameObj(GAME.hideObj);
        return true;
    };
    KEY.setUpHandler("space", function() {
        if (this.isHiding) {
            this.exitHidingPlace();
        }else if (GAME.canHide) {
            this.blend = getTexture("blend");
            this.blend.anchor.set(0.5,0.5);
            this.blend.scale = GAME.scale;
            this.blend.alpha = 0.95;

            let hobj = GAME.hideObj;

            if (!hobj.health)
                hobj.health = 200;

            this.blend.position.set(hobj.position.x, hobj.position.y-GAME.scale.y*20);
            guiStage.addChild(this.blend);

            let hiddenObj = getTexture(hobj._texture.baseTexture.imageUrl.slice(10, -4)+'X');
            ["position", "anchor", "scale"].forEach(function(f){
                hiddenObj[f] = hobj[f];
            });
            GAME.getCurrentStage().removeChild(hobj);
            GAME.toKill = hiddenObj;
            GAME.pushGameObj(hiddenObj);

            GAME.getCurrentStage().removeChild(this.sprite);
            this.isHiding = true;
        }
    }.bind(this));

    this.sprite = getTexture("heroF1");
    this.speed = 0.1;
    this.persfac = 0.8;

    getPlayer = function(fname) {
        let t = getTexture(fname);
        let scalefactor = 0.8;
        t.scale.set(scalefactor * GAME.scale.x, scalefactor * GAME.scale.y);
        t.anchor.set(0.5,1);
        return t;
    };

    this.downSprites = [
        getPlayer("heroF1"), getPlayer("heroF2")
    ];
    this.sideSprites = [
        getPlayer("heroS1"), getPlayer("heroS2")
    ];
    this.upSprites = [
        getPlayer("heroB1"), getPlayer("heroB2")
    ];

    this.allSprites = [
        this.upSprites,
        this.sideSprites,
        this.downSprites,
    ];

    this.postfix = function() {
        let scalefactor = 0.8;
        this.sprite.scale.set(scalefactor * GAME.scale.x, scalefactor * GAME.scale.y);
        this.sprite.anchor.set(0.5,1);
    };

    this.show = this.downSprites;
    this.currentindex = 0;
    let animmax = 20;
    this.animstate = animmax;
    this.currentface = 2;

    this.flip = function(undo = false) {
        if (undo) {
            for (let i = 0; i < this.show.length; i++) {
                this.show[i].scale.x = Math.abs(this.show[i].scale.x);
            }
        } else {
            for (let i = 0; i < this.show.length; i++) {
                this.show[i].scale.x = -1 * Math.abs(this.show[i].scale.x);
            }
        }
    };

    this.switch_sprite_array = function(to) {
        GAME.getCurrentStage().removeChild(this.sprite);
        switch (to) {
            case 0:
                this.show = this.upSprites;
                break;
            case 1:
                this.show = this.sideSprites;
                break;
            case 2:
                this.show = this.downSprites;
                break;
            case 3:
                this.show = this.sideSprites;
                break;
        }
        this.sprite = this.show[this.currentindex];

        if (to == 1) {
            this.flip(false);
        } else {
            this.flip(true);
        }
        GAME.pushGameObj(this.sprite);
        this.currentface = to;
    };

    this.gbb = function(goi) {
        let g = new PIXI.Graphics();
        g.lineStyle(5, 0x00FF00);
        g.drawRect(goi.position.x-goi.width/2, goi.position.y-goi.height, goi.width, goi.height);
        GAME.getCurrentStage().addChild(g);
        setTimeout(function(){GAME.getCurrentStage().removeChild(g);},30);
    };

    this.draw_colls = function() {
        let g = new PIXI.Graphics();
        g.lineStyle(2, 0x999999);
        g.drawRect(this.pos.x-this.sprite.width/2, this.pos.y-this.sprite.height, this.sprite.width, this.sprite.height);
        g.lineStyle(5, 0x0000FF);
        g.drawCircle(this.pos.x, this.pos.y, 10);
        GAME.getCurrentStage().addChild(g);
    };

    this.hud = new PIXI.Graphics();
    this.hidden_health = 100;

    this.update = function() {
        this.sprite.position.set(this.pos.x, this.pos.y);
        if (!this.isHiding) { // Don't move when hiding
            let n = -1;
            let pos_before = this.pos.clone();
            if (KEY.isDown("a")) {
                this.pos.x -= deltaT * this.speed * GAME.scale.x;
                this.animstate -= 1;
                n = 3;
            } else if (KEY.isDown("d")) {
                this.pos.x += deltaT * this.speed * GAME.scale.x;
                this.animstate -= 1;
                n = 1;
            }
            let did_a_bad = false;
            for ( var i = 0; i < GAME.gameobjects.length; i++ ) {
                if (person_is_colliding_bb(this, GAME.gameobjects[i])) {
                    did_a_bad = true;
                    break;
                }
            }
            if (did_a_bad || this.oob()) {
                this.pos = pos_before.clone();
            } else {
                pos_before = this.pos.clone();
            }
            if (KEY.isDown("w")) {
                this.pos.y -= deltaT * this.speed * this.persfac * GAME.scale.y;
                this.animstate -= 1;
                n = 0;
            } else if (KEY.isDown("s")) {
                this.pos.y += deltaT * this.speed * this.persfac * GAME.scale.y;
                this.animstate -= 1;
                n = 2;
            }
            did_a_bad = false;
            for ( let i = 0; i < GAME.gameobjects.length; i++ ) {
                if (person_is_colliding_bb(this, GAME.gameobjects[i])) {
                    did_a_bad = true;
                    break;
                }
            }
            if (did_a_bad || this.oob()) {
                this.pos = pos_before.clone();
            }
            if ( n >= 0 && n != this.currentface ) {
                this.switch_sprite_array(n);
            }
        } else {
            var maxhealth = 100;
            GAME.gobj().lineStyle(50, 0xFF0000);
            let h = GAME.hideObj;
            // Example:
            // let health = 60; // 60%
            // let maxhealth = 100; // 100%
            // let o = Math.PI * (0.5-health/maxhealth/2);
            let o = Math.PI * (0.5 - h.health/(2*maxhealth));
            GAME.gobj().arc(HCENTER, VCENTER, 200, Math.PI+o, -o, false);
            h.health -= 0.02 * deltaT;
            if ( h.health <= 0 ) {
                this.exitHidingPlace();
                GAME.getCurrentStage().removeChild(GAME.hideObj);
                GAME.gameobjects.splice(GAME.gameobjects.indexOf(GAME.hideObj),1);
            }
        }
        if ( this.animstate < 0 ) {
            GAME.getCurrentStage().removeChild(this.sprite);
            this.animstate = animmax;
            this.currentindex = (this.currentindex + 1) % this.show.length;
            this.sprite = this.show[this.currentindex];
            GAME.pushGameObj(this.sprite);
        }
        for ( let i = 0; i < this.allSprites.length; i++ ) {
            for ( var j = 0; j < this.allSprites[i].length; j++) {
                this.allSprites[i][j].position.set(this.pos.x, this.pos.y);
            }
        }
    };
}

// checks whether hard coded points of interest of the
// person lie within the bounding box
let show_colls = false;
function person_is_colliding_bb(person, bbobj) {
    let np = (GAME.scale.x + GAME.scale.y)/2 * 7;
    let bx = bbobj.position.x;
    let by = bbobj.position.y;
    let px = person.pos.x;
    let py = person.pos.y;
    let bh = bbobj.height;
    if ( bbobj.tall ) {
        bh = bh/2;
    }
    let bw = bbobj.width/2;
    if ( bbobj.short_width ) {
        bw = bw * bbobj.short_width;
    }
    let val = (bx + bw > px - np*2) && (bx - bw < px + np*2) && (by - bh < py) && (by > py - np);
    if (show_colls && val) {
        let g = new PIXI.Graphics();
        g.lineStyle(3, 0x00FF00);
        g.drawCircle(bx,by,10);
        GAME.getCurrentStage().addChild(g);
    }
    return val;
    /*
     * +-----+ ^
     * |     | |
     * |     | h
     * |     | |
     * +--b--+ v
     * <--w-->
     *
     */
}
