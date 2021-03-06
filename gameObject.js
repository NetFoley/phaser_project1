class gameObject {
  constructor(game, x= 100, y = 100, type= "human", tint= 0xFFFFFF , maxLife = 100, detectRange = 50, range = 20, damage = 10, attackDelay = 2000, callForHelp = false, chargeAttack = false, explosion = false, zombieBite = false, stayNearHome = false) {
    this.game = game,
    this.type = type,
    this.maxLife= maxLife,
    this.life= maxLife,
    this.detectRange = detectRange,
    this.range = parseInt(range)+10,
    this.damage= damage,
    this.goalX = x,
    this.goalY = y,
    this.homeX = x,
    this.homeY = y,
    this.explosion = explosion,
    this.originalTint = tint,
    this.callForHelp = callForHelp,
    this.chargeAttack = chargeAttack,
    this.callForHelpTime = 0,
    this.stunTime = 0,
    this.zombieBite = zombieBite,
    this.stayNearHome = stayNearHome,
    this.callingForHelp = function() {
      return this.callForHelpTime >= new Date().getTime();
    },
    this.stunned = function() {
      return this.stunTime >= new Date().getTime();
    },
    this.target = undefined,
    this.lastHitTime = 0,
    this.lastChargeTime = 0,
    this.attackDelay = attackDelay,
    this.chargeDelay = attackDelay*10,
    this.alive = function() {
      return this.life > 0;
    },
    this.canAttack = function() {
      return !this.stunned() && this.lastHitTime + this.attackDelay < new Date().getTime();
    },
    this.canCharge = function() {
      return this.chargeAttack && this.lastChargeTime + this.chargeDelay < new Date().getTime();
    },
    this.direction = function() {
      return Math.atan2(this.goalY - this.sprite.y, this.goalX -  this.sprite.x);
    },
    this.size = function() {
      return this.life / 5;
    },
    this.getSpeedX = function() {
      return Math.cos(this.direction());
    },
    this.getSpeedY = function() {
      return Math.sin(this.direction());
    },
    this.moving = function() {
      return ((Math.abs(this.sprite.x - this.goalX)+ Math.abs(this.sprite.y - this.goalY) >= this.getRange()));
    },
    this.sprite = game.physics.add.sprite(x, y, 'forest_sheet');
    this.getScale = function() {
      return (Math.sqrt(this.maxLife) /25 + 0.40);
    },
    this.getDetectRange = function() {
      return this.detectRange * this.getScale();
    }
    this.getType = function() {
      return String(this.type).slice(0,5);
    }
    this.getRange = function(){
      return (this.range+5) * this.getScale();
    },
    this.wanderRange = function(){
      return this.speed * 5 * this.getScale();
    }
    this.speed = 15 + 30/ this.getScale(),
    this.sprite.setScale(this.getScale());
  }

  callHelp() {
    this.callForHelpTime = new Date().getTime() + 500;
  }

  die() {
    this.sprite.setVelocityX(0);
    this.sprite.setVelocityY(0);
    this.sprite.setVisible(false);
    if(this.explosion)
      explode(this, getExplosionDamage(this.life, this.damage));
  }
  getTarget(target) {
    if(target != undefined)
    {
      if(String(target.type).slice(0,5) != String(this.type).slice(0,5))
      {
        if(target.alive() && this.getDistance(target) / target.getScale() < this.getDetectRange() && (this.target == undefined || this.target.alive() == false || this.getDistance(target) < this.getDistance(this.target)))
        {
            this.target = target;
        }
      }
      else {
        if(this.moving() == false && target.alive() && target.callingForHelp() && this.getDistance(target) < this.getDetectRange() *5  )
        {
          console.log("coming");
          this.moveTo(target.sprite.x, target.sprite.y);
        }
      }
    }
  }
  zombiefie(target){
    if(target.alive() == false)
    {
      console.log("New zombie");
      target.life = target.maxLife / 2;
      target.type = this.type ;
      target.originalTint = this.originalTint;
      target.target = undefined;
      this.target = undefined;
      target.detectRange*=3;
      target.zombieBite = true;
    }
  }
  attack() {
    if(this.target != undefined && this.canAttack() && this.getDistance(this.target) <= this.getRange()) {
      if(this.canCharge())
      {
        this.charge();
        this.target.hit(this.damage*2, this);
      }
      else {
        this.target.hit(this.damage, this);
      }

        this.lastHitTime = new Date().getTime();
    }
  }
  charge() {
      console.log("charge");
      this.lastChargeTime = new Date().getTime();
  }
  unStun()
  {
    this.stunTime = new Date().getTime();
  }
  hit(damage, damager) {
    this.life -= damage;
    if(this.target == undefined && damager.alive()){
      this.target = damager;
    }
    let dir = Math.atan2(this.sprite.y - damager.sprite.y, this.sprite.x - damager.sprite.x);
    let force = Math.sqrt(damage / this.maxLife);
    this.stunTime = new Date().getTime() + force*200;

    this.sprite.setVelocityX(200* Math.cos(dir) * force*1.5);
    this.sprite.setVelocityY(200* Math.sin(dir) * force*1.5);

    if(damager.zombieBite && String(damager.type).slice(0,5) != String(this.type).slice(0,5))
      damager.zombiefie(this);
    if(this.life <= 0)
    {
      console.log("dead " + this.type);
      this.sprite.setTintFill(0x000000);
    }
  }
  moveTo(x, y) {
    this.goalY = Math.max(0, Math.min(HEIGHT, y));
    this.goalX = Math.max(0, Math.min(WIDTH, x));
    if(this.goalX < this.sprite.x)
      this.sprite.flipX = true;
    else
      this.sprite.flipX = false;
  }
  simulate() {
    if(this.alive()) {
    this.sprite.setVisible(true);
      if(this.stunned()){
        this.sprite.setTintFill(0xFFFFFD);
      }
      else {
        if(this.sprite.tintTopLeft != this.originalTint)
        {
          if(this.callForHelp)
          {
            this.callHelp();
          }
          this.sprite.setTint(this.originalTint);
        }
      }
      if(this.target == undefined) {
          if(this.moving() == false && Math.random() < 0.01) {
            if(this.stayNearHome == false)
              this.moveTo(around(this.sprite.x, this.wanderRange()), around(this.sprite.y, this.wanderRange()));
            else
            {
              this.moveTo(around(this.homeX, this.wanderRange()), around(this.homeY, this.wanderRange()));

            }
          }
      }
      else {
        if(this.target.alive()){
          this.moveTo(this.target.sprite.x, this.target.sprite.y);
          this.attack();
        }
        else {
          this.target = undefined;
        }
      }
    }
    else {
      if(!this.stunned() && this.sprite.visible == true){
        this.die();
      }
    }
  }

  getDistance(object)
  {
    return Math.abs(this.sprite.x - object.sprite.x) + Math.abs(this.sprite.y - object.sprite.y);
  }

};

function around(value, range)
{
    return (value + (Math.random()-0.5)*range);
}
