// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 설정
const GAME_WIDTH = 320;
const GAME_HEIGHT = 320;
const PIXEL_SIZE = 4;

// --- 데이터베이스 (DB) ---
const SHOP_DB = {
    food: [
        { id: 'f_bread', name: '빵', type: 'food', price: 50, value: 20, weight: 1, icon: '🍞' },
        { id: 'f_sandwich', name: '샌드위치', type: 'food', price: 100, value: 40, weight: 2, icon: '🥪' },
        { id: 'f_soap', name: '비누', type: 'clean', price: 30, value: 30, icon: '🧼' },
        { id: 'f_water', name: '물', type: 'clean', price: 20, value: 20, icon: '💧' },
        { id: 'f_candy', name: '사탕', type: 'mood', price: 40, value: 20, weight: 3, icon: '🍬' }, 
        { id: 'f_diet', name: '다이어트 샐러드', type: 'diet', price: 150, value: -2, weight: -2, icon: '🥗' },
        { id: 'f_medicine', name: '의사선생님', type: 'medicine', price: 300, value: 0, icon: '👨‍⚕️' }
    ],
    colors: [
        { id: 'c_default', name: '기본 핑크', type: 'color', price: 0, unlockLv: 1, value: '#ffafcc' },
        { id: 'c_blue', name: '스카이 블루', type: 'color', price: 300, unlockLv: 2, value: '#87CEEB' },
        { id: 'c_green', name: '민트 그린', type: 'color', price: 300, unlockLv: 2, value: '#98ff98' },
        { id: 'c_purple', name: '라벤더', type: 'color', price: 500, unlockLv: 3, value: '#E6E6FA' },
        { id: 'c_gold', name: '황금색', type: 'color', price: 2000, unlockLv: 10, value: '#FFD700' },
        { id: 'c_black', name: '시크 블랙', type: 'color', price: 1000, unlockLv: 5, value: '#555555' }
    ],
    items: [ // 악세사리
        { id: 'acc_none', name: '없음', type: 'item', price: 0, unlockLv: 1 },
        { id: 'acc_ribbon', name: '빨간 리본', type: 'item', price: 500, unlockLv: 3, icon: '🎀', offsetY: -25, scale: 0.5 },
        { id: 'acc_glasses', name: '선글라스', type: 'item', price: 800, unlockLv: 5, icon: '🕶️', offsetY: -20 },
        { id: 'acc_crown', name: '왕관', type: 'item', price: 3000, unlockLv: 15, icon: '👑', offsetY: -30, scale: 0.5 },
        { id: 'acc_flower', name: '꽃핀', type: 'item', price: 400, unlockLv: 2, icon: '🌸', offsetY: -25, scale: 0.33 }
    ],
    tools: [
        { id: 'item_bonfire', name: '모닥불', type: 'tool', price: 100, unlockLv: 1, icon: '🔥' }
    ],
    backgrounds: [
        { id: 'bg_default', name: '심플 그레이', type: 'bg', price: 0, unlockLv: 1, color: '#f0f0f0' },
        { id: 'bg_forest', name: '숲속', type: 'bg', price: 1000, unlockLv: 4, color: '#98FB98' },
        { id: 'bg_sky', name: '구름 위', type: 'bg', price: 1200, unlockLv: 6, color: '#E0FFFF' },
        { id: 'bg_night', name: '밤하늘', type: 'bg', price: 1500, unlockLv: 8, color: '#191970' }
    ]
};

// 문제 데이터
const QUESTIONS = [
    { q: "Apple의 뜻은?", options: ["사과", "바나나", "포도"], a: 0 },
    { q: "10 - 3 = ?", options: ["6", "7", "8"], a: 1 },
    { q: "개구리는 어떻게 울까?", options: ["멍멍", "야옹", "개굴"], a: 2 },
    { q: "신호등의 멈춤 색깔은?", options: ["초록", "노랑", "빨강"], a: 2 },
    { q: "얼음이 녹으면?", options: ["물", "불", "흙"], a: 0 },
    { q: "우리나라의 수도는?", options: ["부산", "서울", "제주"], a: 1 },
    { q: "3 x 3 = ?", options: ["6", "9", "12"], a: 1 },
    { q: "Sky의 뜻은?", options: ["땅", "바다", "하늘"], a: 2 }
];

// 상태 관리
let gameState = {
    gold: 500,
    level: 1,
    exp: 0,
    maxExp: 100,
    age: 0, 
    isLightOn: true,
    isDead: false,
    isSick: false, 
    sicknessTimer: 0, 
    stage: 'egg', 
    petName: '',
    egg: {
        temp: 0,
        progress: 0,
        hasBonfire: false,
        timer: 60 
    },
    stats: {
        hunger: 80,
        clean: 80,
        sleep: 80,
        mood: 80,
        bladder: 80,
        weight: 10,
        discipline: 0,
        intellect: 0 // 지능 추가
    },
    poops: [], 
    inventory: ['c_default', 'acc_none', 'bg_default'], 
    equipped: {
        bodyColor: 'c_default',
        accessory: 'acc_none',
        background: 'bg_default'
    },
    pet: {
        x: 160,
        y: 200,
        direction: 1,
        state: 'idle', 
        animTimer: 0,
        emote: null,
        isBadlyBehaving: false, 
        eatingIcon: null,
        jumpHeight: 0,
        praiseTimer: 0, 
        scoldTimer: 0 
    },
    soul: {
        y: 0,
        opacity: 0
    },
    minigame: {
        active: false,
        type: null, 
        score: 0,
        ropeAngle: 0, 
        ropeSpeed: 0.1,
        isJumping: false,
        dodge: {
            obstacles: [], 
            spawnTimer: 0
        },
        gameOver: false,
        countdown: -1 
    }
};

// 펫 기본 스프라이트 (16x16)
const BASE_PIXELS = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,1,2,2,1,0,0,0,1,2,2,1,0,0,0],
    [0,0,1,2,2,1,0,0,0,1,2,2,1,0,0,0],
    [0,0,1,2,2,1,0,0,0,1,2,2,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,3,3,2,2,2,2,2,3,3,2,1,0],
    [1,2,2,3,3,2,2,2,2,2,3,3,2,2,1],
    [1,2,2,2,2,2,6,6,2,2,2,2,2,2,1],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,1,0,1,2,2,2,2,2,2,2,1,0,1,0],
    [0,0,0,1,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// 동적 스프라이트 생성
function getCurrentSprite() {
    const sprite = JSON.parse(JSON.stringify(BASE_PIXELS));
    const pet = gameState.pet;
    const timer = Math.floor(pet.animTimer / 200);

    if (gameState.stage === 'egg') return sprite; 

    if (pet.state === 'sleep' || gameState.stats.sleep < 20) {
        sprite[7][3] = 2; sprite[7][4] = 2; sprite[7][10] = 2; sprite[7][11] = 2;
        sprite[8][3] = 1; sprite[8][4] = 1; sprite[8][10] = 1; sprite[8][11] = 1;
    } else if (gameState.pet.isBadlyBehaving) {
        // 화난 눈 (날카롭게)
        sprite[7][3] = 0; sprite[7][4] = 1; sprite[7][10] = 1; sprite[7][11] = 0;
        sprite[8][3] = 1; sprite[8][4] = 0; sprite[8][10] = 0; sprite[8][11] = 1;
    } else if (pet.emote === '❤️' || pet.state === 'jump' || pet.state === 'love') {
        sprite[7][3] = 1; sprite[7][4] = 0; sprite[7][10] = 1; sprite[7][11] = 0;
        sprite[8][3] = 0; sprite[8][4] = 1; sprite[8][10] = 0; sprite[8][11] = 1;
        
        if (pet.state === 'love') {
            sprite[9][3] = 4; // 볼터치
            sprite[9][11] = 4;
        }
    } else if (gameState.isSick) {
        // 아픈 눈 (> <)
        sprite[7][3] = 1; sprite[7][4] = 0; sprite[7][10] = 0; sprite[7][11] = 1;
        sprite[8][3] = 0; sprite[8][4] = 1; sprite[8][10] = 1; sprite[8][11] = 0;
        // 입 벌림
        sprite[9][7] = 0; 
    }

    // 죽었을 때
    if (gameState.isDead) {
        sprite[7][3] = 1; sprite[7][4] = 0; sprite[7][10] = 1; sprite[7][11] = 0;
        sprite[8][3] = 0; sprite[8][4] = 1; sprite[8][10] = 0; sprite[8][11] = 1;
        // X X 눈 (간단히 3번 색으로 표현하거나 모양 변경)
        sprite[7][3] = 1; sprite[7][11] = 1;
        sprite[8][4] = 1; sprite[8][10] = 1;
    }

    sprite[12][1] = 0; sprite[12][3] = 0; sprite[12][11] = 0; sprite[12][13] = 0;
    sprite[13][3] = 0; sprite[13][11] = 0;

    if (pet.state === 'walk') {
        if (timer % 2 === 0) {
            sprite[12][1] = 1; sprite[12][13] = 1; 
        } else {
            sprite[13][1] = 1; sprite[13][13] = 1; 
        }
    } else if (pet.state === 'jump' || pet.emote === '❤️') {
        sprite[11][0] = 1; sprite[11][14] = 1; 
        sprite[12][1] = 1; sprite[12][13] = 1;
    } else if (pet.state === 'sleep') {
        sprite[13][1] = 1; sprite[13][13] = 1;
    } else {
        sprite[13][1] = 1; sprite[13][13] = 1;
    }

    return sprite;
}

// --- 게임 루프 ---
let lastTime = 0;
let electricityTimer = 0;

function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (!gameState.isDead) {
        if (gameState.minigame.active) {
            updateMinigame();
        }
        update(dt);
    } else {
        if (gameState.soul.opacity > 0) {
            gameState.soul.y -= 0.5;
            gameState.soul.opacity -= 0.005;
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// 타이머 및 스탯 관리
let gameTick = 0;
setInterval(() => {
    if (gameState.isDead) return;
    
    // 알 상태일 때: 타이머 감소, 스탯 감소 X
    if (gameState.stage === 'egg') {
        gameState.egg.timer -= 1;
        if (gameState.egg.timer <= 0) {
            die("알이 식어서 깨어나지 못했어...");
        }
        updateUI();
        return;
    }
    
    gameTick++;
    
    // 나이 증가 (30초마다 1일)
    if (gameTick % 30 === 0) {
        gameState.age++;
        if (gameState.age % 10 === 0) showSpeechBubble(`벌써 ${gameState.age}살이야!`);
    }

    // 랜덤 반항 (버릇 없음)
    if (gameState.stage !== 'egg' && gameState.pet.state !== 'sleep' && !gameState.isSick && Math.random() < 0.005) {
        if (!gameState.pet.isBadlyBehaving) {
            gameState.pet.isBadlyBehaving = true;
            gameState.pet.emote = '💢';
            showSpeechBubble("싫어! 다 싫어!");
        }
    }

    // 똥 생성 (랜덤)
    if (gameState.pet.state !== 'sleep' && Math.random() < 0.02) { 
        if (gameState.poops.length < 5) {
            gameState.poops.push({
                x: Math.random() * (GAME_WIDTH - 40) + 20,
                y: GAME_HEIGHT - 40 + (Math.random() * 20 - 10)
            });
            showSpeechBubble("응가 했어...");
            gameState.stats.clean -= 10;
            gameState.stats.bladder = 100; 
        }
    }

    // 똥이 있으면 청결도 지속 감소
    if (gameState.poops.length > 0) {
        if (gameTick % 2 === 0) gameState.stats.clean -= 2;
    }
    
    if (gameTick % 5 === 0) {
        if (gameState.stats.hunger > 0) gameState.stats.hunger -= 1;
        if (gameState.stats.clean > 0) gameState.stats.clean -= 1;
        if (gameState.stats.bladder > 0) gameState.stats.bladder -= 1;
        
        if (gameState.pet.state === 'sleep') {
            if (gameState.stats.sleep < 100) gameState.stats.sleep += 5; // 수면 회복 속도 증가 (2 -> 5)
        } else {
            if (gameState.stats.sleep > 0) gameState.stats.sleep -= 1;
        }
        
        if (gameState.isLightOn && gameState.pet.state !== 'sleep') {
            if (gameState.stats.mood > 0) gameState.stats.mood -= 0.5;
        } else if (!gameState.isLightOn && gameState.pet.state !== 'sleep') {
            if (gameState.stats.mood > 0) gameState.stats.mood -= 5;
        }
    }
    
    if (gameState.isLightOn && gameState.pet.state !== 'sleep') {
        electricityTimer++;
        if (electricityTimer >= 5) {
            electricityTimer = 0;
            if (gameState.gold >= 5) {
                gameState.gold -= 5;
            } else {
                gameState.isLightOn = false;
                showSpeechBubble("전기세가 없어서 불이 꺼졌어... ㅠㅠ");
            }
        }
    }
    
    if (gameState.stats.clean <= 0) {
        if (!gameState.isSick) {
            gameState.isSick = true;
            showSpeechBubble("몸이 안 좋아... 약 좀 줘... 🤢");
        }
    }
    
    if (gameState.isSick) {
        gameState.sicknessTimer++;
        if (gameState.sicknessTimer % 5 === 0) gameState.stats.mood -= 1; 
        
        if (gameState.sicknessTimer >= 60) {
            die("병을 치료하지 못해서...");
        }
    } else {
        // 병이 나았을 때 처리 (useConsumable에서 함)
    }

    if (gameState.stats.hunger <= 0) {
        die("배고파서 힘이 없어...");
    } else if (gameState.stats.mood <= 0) {
        die("너무 우울해서 떠날래...");
    } else if (gameState.stats.bladder <= 0) {
        gameState.stats.bladder = 50;
        gameState.stats.clean = 0;
        showSpeechBubble("앗... 실수했어...");
    }

    updateUI();
}, 1000);

function die(reason) {
    if (gameState.isDead) return;
    
    gameState.isDead = true;
    gameState.pet.state = 'dead';
    
    gameState.soul.y = gameState.pet.y;
    gameState.soul.opacity = 1.0;
    
    showSpeechBubble(reason);
}

function update(dt) {
    if (gameState.stage === 'egg') {
        if (gameState.egg.temp > 0) gameState.egg.temp -= 0.5;
        
        if (gameState.egg.temp > 40 && gameState.egg.temp < 80) {
            gameState.egg.progress += 0.5;
            if (gameState.egg.progress >= 100) hatchEgg();
        }
        return;
    }

    const pet = gameState.pet;
    pet.animTimer += dt;

    if (pet.state === 'eating' || pet.state === 'shower' || pet.state === 'dead' || pet.state === 'sleep' || pet.state === 'toilet') {
        return;
    }

    if (Math.random() < 0.02 && pet.state === 'idle' && !pet.isBadlyBehaving) {
        // 10% 확률로 애교 부리기
        if (Math.random() < 0.1) {
            pet.state = 'love';
            pet.emote = '❤️';
            
            const loveMsg = ["사랑해!", "좋아해!", "뿌잉뿌잉", "놀아줘~", "헤헤"];
            // 이모지 중복 방지 (텍스트만)
            showSpeechBubble(loveMsg[Math.floor(Math.random() * loveMsg.length)]);

            setTimeout(() => {
                if (pet.state === 'love') {
                    pet.state = 'idle';
                    pet.emote = null;
                }
            }, 2000);
        } else {
            pet.state = 'walk';
            pet.direction = Math.random() > 0.5 ? 1 : -1;
        }
    } else if (Math.random() < 0.02 && pet.state === 'walk') {
        pet.state = 'idle';
    }

    if (pet.state === 'walk') {
        pet.x += pet.direction * 0.5;
        if (pet.x < 50) { pet.x = 50; pet.direction = 1; }
        if (pet.x > GAME_WIDTH - 50) { pet.x = GAME_WIDTH - 50; pet.direction = -1; }
        
        if (Math.floor(Date.now() / 200) % 2 === 0) pet.y = 198;
        else pet.y = 200;
    } 
    else if (pet.state === 'idle') {
        pet.y = 200;
        if (Math.floor(Date.now() / 500) % 2 === 0) pet.y = 201;
    }
}

function draw() {
    const bgItem = SHOP_DB.backgrounds.find(b => b.id === gameState.equipped.background);
    ctx.fillStyle = bgItem ? bgItem.color : '#f0f0f0';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#d0d0d0';
    ctx.fillRect(0, 230, GAME_WIDTH, 90);

    if (gameState.pet.state === 'sleep') {
        if (gameState.stage === 'baby') {
            drawCribBack(gameState.pet.x, gameState.pet.y);
        } else {
            drawBedBack(gameState.pet.x, gameState.pet.y);
        }
    }

    if (gameState.stage === 'egg') {
        ctx.fillStyle = '#fff'; 
        ctx.beginPath();
        ctx.ellipse(gameState.pet.x, gameState.pet.y, 25, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.petName || '알', gameState.pet.x, gameState.pet.y - 50);

        ctx.fillStyle = 'red';
        ctx.font = '10px sans-serif';
        ctx.fillText(`남은 시간: ${gameState.egg.timer}초`, gameState.pet.x, gameState.pet.y - 70);

        if (gameState.egg.hasBonfire) {
            const fireSize = 30 + (gameState.egg.temp / 5); 
            ctx.font = `${fireSize}px sans-serif`;
            ctx.fillText('🔥', gameState.pet.x + 40, gameState.pet.y + 20);
            
            ctx.fillStyle = '#333';
            ctx.fillRect(gameState.pet.x - 30, gameState.pet.y + 50, 60, 5);
            
            let tempColor = 'blue';
            if (gameState.egg.temp > 40 && gameState.egg.temp < 80) tempColor = 'green'; 
            else if (gameState.egg.temp >= 80) tempColor = 'red'; 
            
            ctx.fillStyle = tempColor;
            ctx.fillRect(gameState.pet.x - 30, gameState.pet.y + 50, Math.min(60, gameState.egg.temp * 0.6), 5);
            
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#333';
            ctx.fillText(`부화중... ${Math.floor(gameState.egg.progress)}%`, gameState.pet.x, gameState.pet.y + 70);
        } else {
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText('모닥불이 필요해...', gameState.pet.x, gameState.pet.y + 50);
        }
        return;
    }

    if (gameState.pet.state === 'dead') {
        ctx.save();
        ctx.translate(gameState.pet.x, gameState.pet.y + 20);
        ctx.rotate(90 * Math.PI / 180);
        drawPet(0, 0, gameState.pet.direction);
        ctx.restore();

        if (gameState.soul.opacity > 0) {
            ctx.save();
            ctx.globalAlpha = gameState.soul.opacity;
            ctx.font = '30px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('👻', gameState.pet.x, gameState.soul.y - 40);
            ctx.restore();
        } else {
            ctx.fillStyle = 'black';
            ctx.font = '30px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', GAME_WIDTH/2, GAME_HEIGHT/2);
        }
    } else {
        const drawY = gameState.pet.y - gameState.pet.jumpHeight;
        
        drawPet(gameState.pet.x, drawY, gameState.pet.direction);
        
        if (gameState.pet.state === 'sleep') {
            if (gameState.stage === 'baby') {
                drawCribBlanket(gameState.pet.x, gameState.pet.y);
            } else {
                drawBlanket(gameState.pet.x, gameState.pet.y);
            }
        }
        drawAccessory(gameState.pet.x, drawY, gameState.pet.direction);
        
        if (gameState.minigame.active) {
            if (gameState.minigame.type === 'rope') {
                drawRope();
            } else if (gameState.minigame.type === 'dodge') {
                drawDodgeGame();
            }
        }
    }

    if (gameState.pet.emote) {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        // 이모지 위치 수정 (더 아래로)
        ctx.fillText(gameState.pet.emote, gameState.pet.x - 30, gameState.pet.y - 20);
    } else if (gameState.isSick) {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        const floatY = Math.sin(Date.now() / 200) * 5;
        ctx.fillText('🤢', gameState.pet.x, gameState.pet.y - 40 + floatY);
    }

    // 교감 애니메이션 (칭찬)
    if (gameState.pet.praiseTimer > 0) {
        gameState.pet.praiseTimer--;
        const handX = gameState.pet.x + 20 + Math.sin(Date.now() / 100) * 10; // 오른쪽으로 이동 (+20)
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👋', handX, gameState.pet.y - 10); // 훨씬 더 아래로 (-10)
    }
    
    // 교감 애니메이션 (꾸중)
    if (gameState.pet.scoldTimer > 0) {
        gameState.pet.scoldTimer--;
        if (Math.floor(Date.now() / 100) % 2 === 0) { 
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        }
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', gameState.pet.x + 20, gameState.pet.y - 10); // 오른쪽(+20) & 아래로(-10)
    }

    if (gameState.pet.state === 'sleep') {
        const frame = Math.floor(gameState.pet.animTimer / 500) % 3;
        const zText = '.'.repeat(frame + 1).replace(/\./g, 'Z');
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#333';
        ctx.fillText(zText, gameState.pet.x + 30, gameState.pet.y - 40);
        
        ctx.fillStyle = 'rgba(0, 0, 50, 0.3)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    if (!gameState.isLightOn) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // 똥 그리기
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    gameState.poops.forEach(p => {
        ctx.fillText('💩', p.x, p.y);
    });

    // 말풍선 위치 업데이트
    const bubble = document.getElementById('pet-bubble');
    if (!bubble.classList.contains('hidden')) {
        bubble.style.left = `${gameState.pet.x}px`;
        bubble.style.top = `${gameState.pet.y - 90}px`; 
        bubble.style.transform = 'translate(-50%, -50%)';
    }
}

function drawBedBack(x, y) {
    const bedX = x - 40;
    const bedY = y - 10;
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(bedX, bedY + 20, 80, 20); 
    ctx.fillRect(bedX, bedY - 10, 80, 40); 
    ctx.fillStyle = '#fff';
    ctx.fillRect(bedX + 5, bedY + 10, 70, 15);
    ctx.fillStyle = '#ddd';
    ctx.fillRect(bedX + 10, bedY + 5, 30, 15);
}

function drawBlanket(x, y) {
    const bedX = x - 40;
    const bedY = y - 10;
    ctx.fillStyle = '#ff9999';
    ctx.fillRect(bedX + 5, bedY + 20, 70, 25);
    ctx.fillStyle = '#ffcccc';
    ctx.fillRect(bedX + 5, bedY + 20, 70, 5);
}

function drawRope() {
    const centerX = 160;
    ctx.beginPath();
    const startX = 0;
    const endX = 320;
    const cpY = 220 - Math.cos(gameState.minigame.ropeAngle) * 130;
    
    ctx.moveTo(startX, 150); 
    ctx.quadraticCurveTo(centerX, cpY, endX, 150); 
    
    const isFront = Math.sin(gameState.minigame.ropeAngle) > 0;
    ctx.strokeStyle = isFront ? '#8b4513' : 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = isFront ? 3 : 2;
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    // 점수 위치 하단으로 이동
    ctx.fillText(`SCORE: ${gameState.minigame.score}`, GAME_WIDTH / 2, 60);

    if (gameState.minigame.countdown > 0) {
        ctx.fillStyle = 'red';
        ctx.font = '40px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.minigame.countdown, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else if (gameState.minigame.countdown === 0) {
        ctx.fillStyle = 'red';
        ctx.font = '40px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText("GO!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
}

function drawPet(x, y, dir) {
    const isBaby = gameState.stage === 'baby';
    const isChild = gameState.stage === 'child';
    const isTeen = gameState.stage === 'teen';
    
    let pixelScale = 6;
    if (isBaby) pixelScale = 4;
    else if (isChild) pixelScale = 5; 
    else if (isTeen) pixelScale = 5.5;

    const sprite = getCurrentSprite();
    
    const colorItem = SHOP_DB.colors.find(c => c.id === gameState.equipped.bodyColor);
    const bodyColor = colorItem ? colorItem.value : '#ffafcc';

    const offsetX = x - (sprite[0].length * pixelScale) / 2;
    const offsetY = y - (sprite.length * pixelScale) / 2 + (isBaby ? 20 : (isChild ? 10 : (isTeen ? 5 : 0))); 

    for (let r = 0; r < sprite.length; r++) {
        for (let c = 0; c < sprite[r].length; c++) {
            let type = sprite[r][c];
            if (type === 0) continue;

            const colIndex = dir === 1 ? c : (sprite[r].length - 1 - c);
            
            let color = '#000';
            if (type === 1) color = '#333';
            else if (type === 2) color = bodyColor;
            else if (type === 3) color = '#000';
            else if (type === 4) color = '#ff9999'; 
            else if (type === 5) color = '#fff';
            else if (type === 6) color = '#333';

            if (isBaby) {
                if (r >= 13 && type === 2) color = '#fff';
                if (r === 9 && (c === 6 || c === 7)) color = '#87CEEB'; 
            }

            ctx.fillStyle = color;
            ctx.fillRect(
                offsetX + colIndex * pixelScale, 
                offsetY + r * pixelScale, 
                pixelScale, pixelScale
            );
        }
    }

    if (gameState.pet.state === 'shower') {
        ctx.font = '30px sans-serif';
        ctx.fillText('🚿', x, y - 40);
        ctx.fillStyle = 'rgba(200, 200, 255, 0.5)';
        for(let i=0; i<5; i++) {
            ctx.beginPath();
            ctx.arc(x + (Math.random()*40-20), y + (Math.random()*40-20), 3, 0, Math.PI*2);
            ctx.fill();
        }
    } else if (gameState.pet.state === 'eating') {
        if (gameState.pet.eatingIcon) {
            ctx.font = '20px sans-serif';
            const moveY = Math.sin(gameState.pet.animTimer / 100) * 2;
            ctx.fillText(gameState.pet.eatingIcon, x + (dir * 20), y + 10 + moveY);
        }
        ctx.font = '30px sans-serif';
        ctx.fillText('😋', x, y - 40);
    } else if (gameState.pet.state === 'toilet') {
        drawToilet(x, y);
    }
}

function drawToilet(x, y) {
    const tissueX = x - 60; 
    const tissueY = y + 50; 
    ctx.font = '30px sans-serif';
    ctx.fillText('🧻', tissueX, tissueY);
}

function drawAccessory(x, y, dir) {
    const accId = gameState.equipped.accessory;
    if (accId === 'acc_none') return;

    const accItem = SHOP_DB.items.find(i => i.id === accId);
    if (!accItem) return;

    const fontSize = accItem.scale ? 40 * accItem.scale : 40;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    
    let offsetY = accItem.offsetY !== undefined ? accItem.offsetY : -60;
    
    if (gameState.stage === 'baby') {
        offsetY += 35; // 아기는 훨씬 아래로
    } else if (gameState.stage === 'child') {
        offsetY += 20; // 어린이는 적당히 아래로
    } else if (gameState.stage === 'teen') {
        offsetY += 10; // 청소년은 조금만
    }

    const itemY = y + offsetY;
    const adjustX = dir === 1 ? 5 : -5;

    ctx.fillText(accItem.icon, x + adjustX, itemY);
}

// --- UI 및 로직 ---
function updateUI() {
    document.getElementById('gold-display').innerText = `${gameState.gold} P`;
    document.getElementById('level-display').innerText = `LV.${gameState.level} (${gameState.age}일)`;
    
    if (gameState.stage === 'egg') {
        document.querySelector('.status-bars').style.display = 'none';
    } else {
        document.querySelector('.status-bars').style.display = 'flex';
    }
    
    document.getElementById('bar-hunger').style.width = `${gameState.stats.hunger}%`;
    document.getElementById('bar-clean').style.width = `${gameState.stats.clean}%`;
    document.getElementById('bar-sleep').style.width = `${gameState.stats.sleep}%`;
    document.getElementById('bar-mood').style.width = `${gameState.stats.mood}%`;
    document.getElementById('bar-bladder').style.width = `${gameState.stats.bladder}%`;
}

function showSpeechBubble(text) {
    const bubble = document.getElementById('pet-bubble');
    bubble.innerText = text;
    bubble.classList.remove('hidden');
    bubble.style.left = '50%';
    bubble.style.top = '40%';
    bubble.style.transform = 'translate(-50%, -50%)';

    setTimeout(() => {
        bubble.classList.add('hidden');
    }, 3000);
}

function toggleSleep() {
    if (gameState.isDead) return;
    if (gameState.stage === 'egg') {
        showSpeechBubble("지금은 할 수 없어...");
        return;
    }
    if (gameState.pet.state === 'sleep') {
        wakeUp();
    } else {
        goToSleep();
    }
}

function goToSleep() {
    if (gameState.isDead) return;
    gameState.pet.state = 'sleep';
    gameState.pet.x = 160; 
    gameState.pet.y = 200;
    gameState.isLightOn = false; 
    showSpeechBubble("잘 자... Zzz");
}

function wakeUp() {
    gameState.pet.state = 'idle';
    gameState.isLightOn = true; 
    showSpeechBubble("좋은 아침! 개운해!");
}

function goToToilet() {
    if (gameState.isDead) return;
    if (gameState.stage === 'egg') {
        showSpeechBubble("지금은 할 수 없어...");
        return;
    }
    if (gameState.pet.state === 'sleep') {
        showSpeechBubble("졸려서 못 가겠어...");
        return;
    }
    
    gameState.pet.state = 'toilet';
    gameState.stats.bladder = 100;
    showSpeechBubble("시원해!");
    
    setTimeout(() => {
        gameState.pet.state = 'idle';
    }, 3000);
}

function openMenu(menuType) {
    if (gameState.isDead) return;
    
    if (gameState.stage === 'egg' && (menuType === 'minigame' || menuType === 'study')) {
        showSpeechBubble("지금은 할 수 없어...");
        return;
    }

    if (gameState.pet.state === 'sleep' && menuType !== 'shop') { 
        showSpeechBubble("쿨쿨 자는 중이야...");
        return;
    }

    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    
    if (menuType === 'study') {
        loadQuiz();
        document.getElementById('study-modal').classList.remove('hidden');
    } else if (menuType === 'shop') {
        renderShop('food');
        document.getElementById('shop-modal').classList.remove('hidden');
    } else if (menuType === 'inventory') {
        renderInventory('food');
        document.getElementById('inventory-modal').classList.remove('hidden');
    } else if (menuType === 'minigame') {
        document.getElementById('minigame-modal').classList.remove('hidden');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function loadQuiz() {
    const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    document.getElementById('quiz-question').innerText = q.q;
    const optsDiv = document.getElementById('quiz-options');
    optsDiv.innerHTML = '';
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => answerQuiz(idx === q.a);
        optsDiv.appendChild(btn);
    });
}

function answerQuiz(isCorrect) {
    if (isCorrect) {
        const reward = 100 + (gameState.level * 20);
        const expGain = 20;
        
        gameState.gold += reward;
        gameState.exp += expGain;
        
        showSpeechBubble(`정답! +${reward} P`);
        
        if (gameState.exp >= gameState.maxExp) {
            gameState.level++;
            gameState.exp = 0;
            gameState.maxExp += 50;
            showSpeechBubble(`🎉 레벨 업! LV.${gameState.level}`);
            
            if (gameState.stage === 'baby' && gameState.level >= 3) {
                gameState.stage = 'child';
                setTimeout(() => {
                    showSpeechBubble(`✨ 어라? ${gameState.petName}이(가) 자랐어!`);
                }, 1500); 
                
                // 폭죽 이펙트
                for(let i=0; i<10; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.innerText = "✨";
                        confetti.style.position = "absolute";
                        confetti.style.left = `${40 + Math.random() * 20}%`;
                        confetti.style.top = `${40 + Math.random() * 20}%`;
                        document.body.appendChild(confetti);
                        setTimeout(() => confetti.remove(), 1000);
                    }, i * 200);
                }
            } else if (gameState.stage === 'child' && gameState.level >= 7) {
                gameState.stage = 'teen';
                setTimeout(() => {
                    showSpeechBubble(`✨ ${gameState.petName}이(가) 청소년이 되었어!`);
                }, 1500);
                
                // 폭죽 이펙트
                for(let i=0; i<10; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.innerText = "🎉";
                        confetti.style.position = "absolute";
                        confetti.style.left = `${40 + Math.random() * 20}%`;
                        confetti.style.top = `${40 + Math.random() * 20}%`;
                        document.body.appendChild(confetti);
                        setTimeout(() => confetti.remove(), 1000);
                    }, i * 200);
                }
            }
        }
        
        updateUI();
        closeAllModals();
        petAction('happy');
    } else {
        showSpeechBubble("틀렸어 ㅠㅠ");
    }
}

function petAction(type) {
    if (gameState.isDead) return;
    if (type === 'happy') {
        gameState.pet.state = 'jump';
        gameState.pet.emote = '❤️';
        let count = 0;
        const jumpInt = setInterval(() => {
            gameState.pet.y = count % 2 === 0 ? 170 : 200;
            count++;
            if (count > 5) {
                clearInterval(jumpInt);
                gameState.pet.state = 'idle';
                gameState.pet.emote = null;
            }
        }, 150);
    }
}

function feedPet() {
    openMenu('inventory');
    showSpeechBubble("가방에서 음식을 줘!");
}

let currentShopTab = 'food';

function switchShopTab(tab) {
    currentShopTab = tab;
    renderShop(tab);
}

function renderShop(tab) {
    const container = document.getElementById('shop-list');
    container.innerHTML = '';
    
    const db = SHOP_DB[tab];
    if (!db) return;
               
    db.forEach(item => {
        const isConsumable = ['food', 'clean', 'sleep', 'mood', 'diet', 'medicine'].includes(item.type);
        const isOwned = !isConsumable && gameState.inventory.includes(item.id);
        const isLocked = item.unlockLv && gameState.level < item.unlockLv;
        
        const el = document.createElement('div');
        el.className = `shop-item ${isLocked ? 'locked' : ''}`;
        
        let previewHtml = '';
        if (item.type === 'color' || item.type === 'bg') {
            const colorVal = item.value || item.color;
            previewHtml = `<div class="color-preview" style="background:${colorVal}"></div>`;
        } else {
            previewHtml = `<div class="icon-preview">${item.icon || ''}</div>`;
        }

        el.innerHTML = `
            ${previewHtml}
            <div class="item-info">
                <div class="name">${item.name}</div>
                <div class="price">${isLocked ? `LV.${item.unlockLv} 해금` : (isOwned ? '보유중' : `${item.price} P`)}</div>
            </div>
        `;
        
        if (!isLocked && !isOwned) {
            el.onclick = () => buyItem(item);
            el.style.cursor = 'pointer';
        } else if (!isLocked && isConsumable) {
             el.onclick = () => buyItem(item);
             el.style.cursor = 'pointer';
        }
        
        container.appendChild(el);
    });
}

function buyItem(item) {
    if (gameState.gold >= item.price) {
        if (confirm(`${item.name}을(를) ${item.price}P에 구매하시겠습니까?`)) {
            gameState.gold -= item.price;
            
            if (item.id === 'item_bonfire') {
                gameState.egg.hasBonfire = true;
                showSpeechBubble("모닥불 설치 완료! A버튼으로 부채질하자!");
            } else {
                gameState.inventory.push(item.id);
            }
            
            updateUI();
            renderShop(currentShopTab);
            if (item.id !== 'item_bonfire') showSpeechBubble("구매 완료!");
        }
    } else {
        showSpeechBubble("돈이 부족해...");
    }
}

let currentInvTab = 'food';

function switchInvTab(tab) {
    currentInvTab = tab;
    renderInventory(tab);
}

function renderInventory(tab) {
    const container = document.getElementById('inv-list');
    container.innerHTML = '';
    
    const db = SHOP_DB[tab];
    if (!db) return;
    
    const myItemIds = gameState.inventory.filter(id => db.some(dbItem => dbItem.id === id));
    
    const itemCounts = {};
    myItemIds.forEach(id => {
        itemCounts[id] = (itemCounts[id] || 0) + 1;
    });
    
    const uniqueIds = Object.keys(itemCounts);
    
    if (uniqueIds.length === 0) {
        container.innerHTML = '<div style="padding:20px; color:#666;">아이템이 없습니다.<br>상점에서 구매해보세요!</div>';
        return;
    }

    uniqueIds.forEach(id => {
        const item = db.find(i => i.id === id);
        const count = itemCounts[id];
        
        const el = document.createElement('div');
        el.className = 'shop-item'; 
        
        let isEquipped = false;
        if (tab === 'colors' && gameState.equipped.bodyColor === item.id) isEquipped = true;
        if (tab === 'items' && gameState.equipped.accessory === item.id) isEquipped = true;
        if (tab === 'bg' && gameState.equipped.background === item.id) isEquipped = true;

        let previewHtml = '';
        if (item.type === 'color' || item.type === 'bg') {
            const colorVal = item.value || item.color;
            previewHtml = `<div class="color-preview" style="background:${colorVal}"></div>`;
        } else {
            previewHtml = `<div class="icon-preview">${item.icon || ''}</div>`;
        }

        let actionText = '사용하기';
        if (item.type === 'color' || item.type === 'item' || item.type === 'bg') {
            actionText = isEquipped ? '장착 중' : '장착하기';
        }

        el.innerHTML = `
            ${previewHtml}
            <div class="item-info">
                <div class="name">${item.name} ${count > 1 ? `x${count}` : ''}</div>
                <div class="price" style="color:${isEquipped ? 'red' : 'green'}">
                    ${actionText}
                </div>
            </div>
        `;
        
        el.onclick = () => useOrEquipItem(item);
        el.style.cursor = 'pointer';
        container.appendChild(el);
    });
}

function useOrEquipItem(item) {
    const isConsumable = ['food', 'clean', 'sleep', 'mood', 'diet', 'medicine'].includes(item.type);
    if (isConsumable) {
        useConsumable(item);
    } else {
        equipItem(item);
    }
}

function useConsumable(item) {
    const idx = gameState.inventory.indexOf(item.id);
    if (idx > -1) {
        gameState.inventory.splice(idx, 1);
    }
    
    closeAllModals();

    if (item.type === 'food') {
        gameState.stats.hunger = Math.min(100, gameState.stats.hunger + item.value);
        gameState.pet.state = 'eating';
        gameState.pet.eatingIcon = item.icon;
        showSpeechBubble("냠냠! 맛있어!");
    } else if (item.type === 'clean') {
        gameState.stats.clean = Math.min(100, gameState.stats.clean + item.value);
        gameState.pet.state = 'shower';
        showSpeechBubble("개운해!");
    } else if (item.type === 'sleep') {
        gameState.stats.sleep = Math.min(100, gameState.stats.sleep + item.value);
        showSpeechBubble("졸음이 사라졌어!");
    } else if (item.type === 'mood') {
        gameState.stats.mood = Math.min(100, gameState.stats.mood + item.value);
        showSpeechBubble("기분이 좋아졌어!");
    } else if (item.type === 'diet') {
        gameState.stats.weight = Math.max(1, gameState.stats.weight + item.value);
        showSpeechBubble("몸이 가벼워졌어!");
    } else if (item.type === 'medicine') {
        if (gameState.isSick) {
            gameState.isSick = false;
            gameState.sicknessTimer = 0;
            showSpeechBubble("이제 안 아파! 고마워!");
        } else {
            showSpeechBubble("난 건강해! 안 먹을래.");
            gameState.inventory.push(item.id); 
        }
    }

    if ((item.type === 'food' || item.type === 'mood') && item.weight) {
        gameState.stats.weight += item.weight;
    }

    if (gameState.pet.state !== 'idle') {
        setTimeout(() => {
            gameState.pet.state = 'idle';
            petAction('happy');
        }, 2000);
    }
    
    updateUI();
}

function equipItem(item) {
    if (item.type === 'color') gameState.equipped.bodyColor = item.id;
    if (item.type === 'item') gameState.equipped.accessory = item.id;
    if (item.type === 'bg') gameState.equipped.background = item.id;
    
    renderInventory(currentInvTab);
    showSpeechBubble("장착 완료!");
}

function activateCheat() {
    if (confirm("치트 모드를 활성화하시겠습니까? (모든 아이템 해금)")) {
        gameState.level = 99;
        gameState.gold = 99999;
        
        const allColors = SHOP_DB.colors.map(i => i.id);
        const allItems = SHOP_DB.items.map(i => i.id);
        const allBgs = SHOP_DB.backgrounds.map(i => i.id);
        
        const foods = ['f_bread', 'f_bread', 'f_soap', 'f_soap', 'f_candy', 'f_diet', 'f_medicine'];
        
        gameState.inventory = [...new Set([...allColors, ...allItems, ...allBgs]), ...foods];
        
        updateUI();
        showSpeechBubble("치트키 발동!!");
        petAction('happy');
    }
}

function handleAButton() {
    if (gameState.isDead) return;
    
    if (gameState.stage === 'egg') {
        if (gameState.egg.hasBonfire) {
            fanFire();
        } else {
            showSpeechBubble("모닥불이 필요해!");
            openMenu('shop');
        }
        return;
    }

    if (gameState.minigame.active) {
        jumpRope();
    } else if (gameState.pet.state === 'sleep') {
        wakeUp();
    } else {
        openMenu('study');
    }
}

function fanFire() {
    gameState.egg.temp += 10;
    if (gameState.egg.temp > 100) gameState.egg.temp = 100;
    
    const fireEffect = document.createElement('div');
    fireEffect.innerText = "🔥";
    fireEffect.style.position = "absolute";
    fireEffect.style.left = "50%";
    fireEffect.style.top = "50%";
    fireEffect.style.fontSize = "20px";
    fireEffect.style.transition = "top 1s, opacity 1s";
    document.body.appendChild(fireEffect);
    
    setTimeout(() => {
        fireEffect.style.top = "40%";
        fireEffect.style.opacity = "0";
    }, 10);
    setTimeout(() => fireEffect.remove(), 1000);
}

function hatchEgg() {
    gameState.stage = 'baby';
    showSpeechBubble(`태어났다! 안녕 ${gameState.petName}!`);
    
    for(let i=0; i<10; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.innerText = "🎉";
            confetti.style.position = "absolute";
            confetti.style.left = `${40 + Math.random() * 20}%`;
            confetti.style.top = `${40 + Math.random() * 20}%`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 1000);
        }, i * 200);
    }
}

function interact(action) {
    if (gameState.isDead || gameState.stage === 'egg' || gameState.pet.state === 'sleep') {
        showSpeechBubble("지금은 할 수 없어...");
        return;
    }
    
    closeAllModals();

    if (action === 'praise') {
        gameState.pet.praiseTimer = 60; 
        gameState.pet.emote = '❤️'; 
        gameState.stats.mood = Math.min(100, gameState.stats.mood + 10);
        showSpeechBubble("기분 최고야!"); 
    } else if (action === 'scold') {
        gameState.pet.scoldTimer = 30; 
        if (gameState.pet.isBadlyBehaving) {
            gameState.pet.isBadlyBehaving = false;
            gameState.stats.discipline = Math.min(100, gameState.stats.discipline + 10);
            gameState.pet.emote = null; 
            showSpeechBubble("잘못했어요... 반성할게.");
        } else {
            gameState.stats.mood = Math.max(0, gameState.stats.mood - 20);
            gameState.pet.emote = '💧';
            showSpeechBubble("왜 혼내는 거야... ㅠㅠ");
            setTimeout(() => { gameState.pet.emote = null; }, 2000);
        }
    }
}

// 전역 스코프에 함수 노출
window.startGameWithInput = function() {
    const nameInput = document.getElementById('pet-name-input').value;
    if (nameInput.trim() === "") {
        alert("이름을 입력해주세요!");
        return;
    }
    
    gameState.petName = nameInput;
    document.getElementById('start-modal').classList.add('hidden');
    
    gameState.gold = 200; 
    showSpeechBubble("상점에서 모닥불을 사서 알을 부화시키자!");
    updateUI();
};

window.handleAButton = handleAButton;
window.openMenu = openMenu;
window.closeAllModals = closeAllModals;
window.switchShopTab = switchShopTab;
window.switchInvTab = switchInvTab;
window.buyItem = buyItem;
window.useOrEquipItem = useOrEquipItem;
window.activateCheat = activateCheat;
window.goToToilet = goToToilet;
window.toggleSleep = toggleSleep;
window.startMinigame = startMinigame;
window.answerQuiz = answerQuiz;
window.movePet = movePet;
window.interact = interact;

function startMinigame(type) {
    if (gameState.isDead || gameState.pet.state === 'sleep' || gameState.stage === 'egg') {
        showSpeechBubble("지금은 할 수 없어...");
        return;
    }
    
    closeAllModals();

    gameState.minigame.active = true;
    gameState.minigame.type = type; 
    gameState.minigame.score = 0;
    gameState.minigame.gameOver = false;
    gameState.minigame.countdown = 3;

    gameState.pet.state = 'minigame';
    gameState.pet.x = 160;
    gameState.pet.y = 200;

    if (type === 'rope') {
        gameState.minigame.ropeAngle = 0;
        gameState.minigame.ropeSpeed = 0.07;
    } else if (type === 'dodge') {
        gameState.minigame.dodge.obstacles = [];
        gameState.minigame.dodge.spawnTimer = 0;
    }
    
    const countInt = setInterval(() => {
        gameState.minigame.countdown--;
        if (gameState.minigame.countdown < 0) {
            clearInterval(countInt);
            const msg = type === 'rope' ? "줄넘기 시작! A 버튼!" : "똥 피하기 시작! 좌우로 이동!";
            showSpeechBubble(msg);
        }
    }, 1000);
}

function movePet(dir) {
    if (!gameState.minigame.active || gameState.minigame.gameOver || gameState.minigame.countdown >= 0) return;
    
    if (gameState.minigame.type === 'dodge') {
        gameState.pet.x += dir * 20;
        if (gameState.pet.x < 20) gameState.pet.x = 20;
        if (gameState.pet.x > GAME_WIDTH - 20) gameState.pet.x = GAME_WIDTH - 20;
        
        gameState.pet.direction = dir;
    }
}

function jumpRope() {
    if (gameState.minigame.type !== 'rope') return;

    if (!gameState.minigame.active || gameState.minigame.countdown >= 0 || gameState.minigame.isJumping || gameState.minigame.gameOver) return;
    
    gameState.minigame.isJumping = true;
    gameState.pet.jumpHeight = 0;
    
    let jumpFrame = 0;
    const jumpInterval = setInterval(() => {
        jumpFrame++;
        if (jumpFrame <= 13) gameState.pet.jumpHeight += 4; 
        else gameState.pet.jumpHeight -= 4;
        
        if (jumpFrame >= 26) { 
            clearInterval(jumpInterval);
            gameState.pet.jumpHeight = 0;
            gameState.minigame.isJumping = false;
        }
    }, 20);
}

function updateMinigame() {
    if (gameState.minigame.gameOver) return;
    if (gameState.minigame.countdown >= 0) return; 
    
    if (gameState.minigame.type === 'rope') {
        updateRopeGame();
    } else if (gameState.minigame.type === 'dodge') {
        updateDodgeGame();
    }
}

function updateRopeGame() {
    gameState.minigame.ropeAngle += gameState.minigame.ropeSpeed;
    if (gameState.minigame.ropeAngle > Math.PI * 2) {
        gameState.minigame.ropeAngle -= Math.PI * 2;
        gameState.minigame.score++;
        
        if (gameState.stats.mood < 100) gameState.stats.mood += 2;
        
        if (gameState.minigame.score % 5 === 0) gameState.minigame.ropeSpeed += 0.01; 
    }

    if (gameState.minigame.score === 0 && gameState.minigame.ropeAngle > 2.0 && gameState.minigame.ropeAngle < 2.3) {
        showSpeechBubble("지금 A 버튼!");
    }
    
    if (gameState.minigame.ropeAngle > 3.0 && gameState.minigame.ropeAngle < 3.28) {
        if (gameState.pet.jumpHeight < 10) { 
             gameOverMinigame();
        }
    }
}

function updateDodgeGame() {
    const dodge = gameState.minigame.dodge;
    dodge.spawnTimer++;
    
    const spawnRate = Math.max(20, 60 - gameState.minigame.score * 2);
    if (dodge.spawnTimer > spawnRate) {
        dodge.spawnTimer = 0;
        const x = Math.random() * (GAME_WIDTH - 20) + 10;
        dodge.obstacles.push({ x: x, y: 0, speed: 2 + gameState.minigame.score * 0.1, type: 'poop' });
    }
    
    for (let i = dodge.obstacles.length - 1; i >= 0; i--) {
        const obs = dodge.obstacles[i];
        obs.y += obs.speed;
        
        if (obs.x > gameState.pet.x - 15 && obs.x < gameState.pet.x + 15 &&
            obs.y > gameState.pet.y - 30 && obs.y < gameState.pet.y) {
            gameOverMinigame();
            return;
        }
        
        if (obs.y > GAME_HEIGHT) {
            dodge.obstacles.splice(i, 1);
            gameState.minigame.score++;
             if (gameState.stats.mood < 100) gameState.stats.mood += 1;
        }
    }
}

function gameOverMinigame() {
    gameState.minigame.gameOver = true;
    showSpeechBubble(`으악! 기록: ${gameState.minigame.score}점`);
    
    const reward = gameState.minigame.score * 10;
    gameState.gold += reward;
    updateUI();
    
    setTimeout(() => {
        alert(`게임 오버! \n기록: ${gameState.minigame.score}점\n보상: ${reward} P`);
        gameState.minigame.active = false;
        gameState.pet.state = 'idle';
    }, 500);
}

function drawDodgeGame() {
    ctx.fillStyle = '#333';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center'; // 중앙 정렬로 변경
    ctx.fillText(`SCORE: ${gameState.minigame.score}`, GAME_WIDTH / 2, 60);
    
    if (gameState.minigame.countdown >= 0) {
        ctx.fillStyle = 'red';
        ctx.font = '40px "Press Start 2P"';
        ctx.textAlign = 'center';
        const text = gameState.minigame.countdown === 0 ? "GO!" : gameState.minigame.countdown;
        ctx.fillText(text, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
    
    const obstacles = gameState.minigame.dodge.obstacles;
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    obstacles.forEach(obs => {
        ctx.fillText('💩', obs.x, obs.y);
    });
}

function drawCribBack(x, y) {
    const w = 80;
    const h = 50;
    const bx = x - w/2;
    const by = y - h/2 + 20;

    ctx.fillStyle = '#E0F7FA'; 
    
    ctx.strokeStyle = '#B2EBF2'; 
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 10) {
        ctx.moveTo(bx + i, by - 20);
        ctx.lineTo(bx + i, by + h);
    }
    ctx.stroke();

    ctx.fillStyle = '#00BCD4'; 
    ctx.fillRect(bx, by - 25, w, 8);
}

function drawCribBlanket(x, y) {
    const w = 80;
    const h = 50;
    const bx = x - w/2;
    const by = y - h/2 + 20;

    ctx.strokeStyle = '#B2EBF2'; 
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= w; i += 10) {
        ctx.moveTo(bx + i, by - 10);
        ctx.lineTo(bx + i, by + h);
    }
    ctx.stroke();

    ctx.fillStyle = '#00BCD4';
    ctx.fillRect(bx, by - 10, w, 8);
    
    ctx.fillRect(bx, by + h - 5, w, 8);
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    for (let i = gameState.poops.length - 1; i >= 0; i--) {
        const p = gameState.poops[i];
        if (Math.abs(x - p.x) < 20 && Math.abs(y - p.y) < 20) {
            gameState.poops.splice(i, 1);
            gameState.stats.clean = Math.min(100, gameState.stats.clean + 10);
            showSpeechBubble("깨끗해졌다!");
            
            if (gameState.gold >= 5) {
                gameState.gold -= 5;
                updateUI();
            } else {
                showSpeechBubble("휴지가 없어... (돈 부족)");
            }
            return;
        }
    }
});

updateUI();
gameLoop(0);
