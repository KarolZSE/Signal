
    const Player = document.getElementById("Player");
    const LocationX = document.getElementById("LocationX");
    const LocationY = document.getElementById("LocationY");
    const line = document.getElementById('line');
    let Disabled = true;

    document.addEventListener("mousemove", (e) => {
        if (Disabled) return;
        temp = e.clientY - Player.offsetHeight / 2 + 'px';
        Player.style.top = temp;
        LocationY.textContent = parseInt(temp) + Player.offsetHeight / 2;
        temp = e.clientX - Player.offsetWidth / 2 + 'px';
        Player.style.left = temp;
        LocationX.textContent = parseInt(temp) + Player.offsetWidth / 2;
        line.style.width = window.innerWidth - e.clientX + 'px';
        line.style.left = e.clientX - Player.offsetWidth / 100 + 'px';
        line.style.top = e.clientY - Player.offsetHeight / 100 + 'px';
        line.textContent = (1.5 / (window.innerWidth / (window.innerWidth - e.clientX))).toFixed(2) + ' sec';
        line.innerHTML = '';
        for (let x = 0; x <= window.innerWidth; x+= 100) {
            const label = document.createElement('span');
            label.classList.add('marker');
            label.style.left = `${x}px`;
            label.textContent = (1.5 / (window.innerWidth / (window.innerWidth - e.clientX - x))).toFixed(2) + ' sec';
            line.appendChild(label);
        }
    });

    let enemyCounter = 0;
    function SpawnEnemy() {
        if (Disabled) return;
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');

        const temp = Math.random();
        const enemyLeft = (window.innerWidth - 96) * temp;
        enemy.style.left = enemyLeft + 'px';
        document.body.appendChild(enemy);

        const enemyturret = document.createElement('div');
        enemyturret.classList.add('enemyturret');
        enemyturret.style.backgroundImage = `url('Turrets/turret_01_mk${Math.floor(Math.random() * 4) + 1}.png')`;
        enemyturret.style.left = (enemy.offsetWidth / 2 - 48) + 'px';

        enemy.appendChild(enemyturret);
        AnimateSprite(enemyturret, 0);

        setTimeout(() => enemy.style.top = window.innerHeight + 'px', 1);
        setTimeout(() => enemy.remove(), 5000);

        const enemyline = document.createElement('div');
        enemyline.classList.add('enemyline');
        enemyline.style.left = enemyLeft + (enemy.offsetWidth / 2) + 'px';
       
        const lineID = `line-${enemyCounter++}`;
        enemyline.id = lineID;
        enemy.dataset.lineID = lineID;

        document.body.appendChild(enemyline);

        setTimeout(() => enemyline.style.top = window.innerHeight + 96 + 'px', 1);
        setTimeout(() => {if (enemyline.parentNode) enemyline.remove();}, 5000);

        let licznik = 0;
        for (let x = 0; x <= window.innerWidth; x+= window.innerWidth / 20) {
            licznik++;
            const label = document.createElement('span');
            label.classList.add('enemymarker');
            label.style.top = `${x}px`;
            label.textContent =  licznik / 2 + ' sec';
            enemyline.appendChild(label);
        }
    }

    function AnimateSprite(sprite, frame) {
        sprite.style.backgroundPosition = `-${frame * 96}px 0`;
        frame = (frame + 1) % 8;
        setTimeout(() => AnimateSprite(sprite, frame), 200);
    }
    
    let x = 1000;
    function WaitToSpawnEnemy() {
        if (Disabled) return;
        SpawnEnemy();
        if (x > 100) x--;
        setTimeout(() => {
            WaitToSpawnEnemy();
        }, x);       
    }
    WaitToSpawnEnemy();

    const FireInTheHole = new Audio('Sounds/FireInTheHole.mp3');
    const Explosion = new Audio('Sounds/explosion.mp3');
    document.addEventListener("mousedown", (e) => {
        if (Disabled) return;
        const plane = document.createElement('div');
        plane.classList.add('plane');
        plane.style.backgroundPosition = `-${Math.floor(Math.random() * 4) * 50}px 0`;
        plane.style.top = e.clientY - Player.offsetHeight / 4 + 'px';
        document.body.appendChild(plane);
        setTimeout(() => plane.style.left = '-50px', 1);
        setTimeout(() => {
            const payload = document.createElement('div');
            payload.classList.add('payload');
            setTimeout(() => payload.style.transform = "scale(0.5)", 1);
            document.body.appendChild(payload);

            // If you want this to by dynamic (Player.offsetWidth / payload.offsetWidth * 2) and not 5
            payload.style.left = e.clientX - Player.offsetWidth / 5 + 'px';
            payload.style.top = e.clientY - Player.offsetHeight / 5 + 'px';

            let temp = 0;
            const AnimateFall = setInterval(() => {
                temp++;
                payload.style.backgroundPosition = `-${temp * 40}px 0`;
                if (temp >= 34) {
                    clearInterval(AnimateFall);
                }
            }, 12.3);
            
            setTimeout(() => {
                clearInterval(AnimateFall);
                payload.style.backgroundPosition = `0 0`;
                payload.style.transition = 'none';
                payload.style.transform = "scale(2)"
                payload.offsetHeight;

                payload.classList.add('destruction');
                PlaySound(Explosion);
            }, 300);
            setTimeout(() => {
                payload.remove();
            }, 700);
        }, 1500 / (window.innerWidth / (window.innerWidth - e.clientX)));
        setTimeout(() => {
            plane.remove();
        }, 3100);
        PlaySound(FireInTheHole);
    })

    function PlaySound(sound) {
        const clone = sound.cloneNode();
        clone.style.display = 'none';
        document.body.appendChild(clone);
        clone.play();
        clone.addEventListener('ended', () => clone.remove());
    }

    let healt = 100;
    const PlayerBase = document.getElementById("PlayerBase");
    const HealtText = document.getElementById("HealtText");
    const BaseHealt = document.getElementById("BaseHealt");

    let Qouta = 0;
    let Count = 0;
    const CountText = document.getElementById("CountText");
    const QoutaText = document.getElementById("QoutaText");

    const Menu = document.getElementById('Menu');
    const DayCount = document.getElementById('DayCount');
    const MenuText = document.getElementById('MenuText');

    function CheckCollision() {
        if (Disabled) return;
        const payloads = document.querySelectorAll('.destruction');
        const enemies = document.querySelectorAll('.enemy');

        payloads.forEach(payload => {
            enemies.forEach(enemy => {
                if (isColliding(enemy, payload)) {
                    const lineID = enemy.dataset.lineID;
                    const enemyline = document.getElementById(lineID);
                    if (enemyline) enemyline.remove();
                    enemy.remove();
                    CountText.textContent = ++Count;
                    if (Count == Qouta) {
                        
                        Count = 0;
                        Menu.style.display = '';
                        AimAssist.style.display = '';
                        MenuText.style.color = '#70b670';
                        MenuText.textContent = "Congratulations! You've succesfully completed today's quota, your crew made some fixes in the camp, Time to rest, recharge, and get ready to take on the next day! Glory to the base!"
                        enemies.forEach(enemy => {enemy.remove();});
                        if (healt > 90) {
                            healt = 100;
                        } else {
                            healt += 10;
                        }

                        if (healt <= 50) {
                            BaseHealt.style.background = `linear-gradient(to left, #d38686 ${100 - healt}%, #90ee90 ${healt}%)`;
                        } else {
                            BaseHealt.style.background = `linear-gradient(to right, #90ee90 ${healt}%, #d38686 ${100 - healt}%)`;
                        }
                        HealtText.textContent = healt;
                        Disabled = true;
                    }
                }
            });
        });

        enemies.forEach(enemy => {
            if (isColliding(enemy, PlayerBase)) {
                const lineID = enemy.dataset.lineID;
                const enemyline = document.getElementById(lineID);
                if (enemyline) enemyline.remove();
                enemy.remove();
                HealtText.textContent = --healt;

                if (healt <= 50) {
                    BaseHealt.style.background = `linear-gradient(to left, #d38686 ${100 - healt}%, #90ee90 ${healt}%)`;
                } else {
                    BaseHealt.style.background = `linear-gradient(to right, #90ee90 ${healt}%, #d38686 ${100 - healt}%)`;
                }

                if (healt <= 0) {
                    Menu.style.display = '';
                    MenuText.style.color = '#b65e5e';
                    MenuText.innerHTML = "Your base has been destroyed! The enemy has triumphed, your crew has scattered. Rest now, brave warrior - the glory is yours alone! <br><br><br> You cannot start a new day..."
                    start.style.display = 'none';
                    Disabled = true;
                }
            }
        });
        requestAnimationFrame(CheckCollision);
    }

    function isColliding(e1, e2) {
        const rect1 = e1.getBoundingClientRect();
        const rect2 = e2.getBoundingClientRect();

        return !(
            rect1.top > rect2.bottom || 
            rect1.bottom < rect2.top || 
            rect1.left > rect2.right || 
            rect1.right < rect2.left
        );
    }
    
    CheckCollision();

    const start = document.getElementById('start');
    let DayCountVar = 0;
    const AimAssist = document.getElementById('AimAssist');

    start.onclick = function() {
        DayCount.textContent = ++DayCountVar;
        Disabled = false;
        Qouta += 10;
        CountText.textContent = Count;
        QoutaText.textContent = Qouta;
        WaitToSpawnEnemy();
        CheckCollision();
        Menu.style.display = 'none';
        AimAssist.style.display = 'none';
        
    }

    AimAssistON = false;
    AimAssist.onclick = function() {
        if (AimAssistON) {
            for (let sheet of document.styleSheets) {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText === '.enemyline') {
                        rule.style.display = 'none';
                        line.style.display = 'none';
                    }
                }
            }
            AimAssistON = false;           
        } else {
            for (let sheet of document.styleSheets) {
                for (let rule of sheet.cssRules) {
                    if (rule.selectorText === '.enemyline') {
                        rule.style.display = 'inline';
                        line.style.display = 'inline';
                    }
                }
            }
            AimAssistON = true;
        }
    }