class Card {
    constructor(suit, value) {
        this.suit = suit;  // 花色：♠♥♣♦
        this.value = value;  // 点数：2-14 (14是A)
        this.selected = false;
    }

    toString() {
        const values = {
            11: 'J', 12: 'Q', 13: 'K', 14: 'A'
        };
        return `${this.suit}${values[this.value] || this.value}`;
    }
}

class Player {
    constructor(name, position) {
        this.name = name;
        this.position = position;  // 0-北 1-东 2-南 3-西
        this.cards = [];
        this.score = 0;
    }

    sortCards() {
        this.cards.sort((a, b) => {
            if (a.suit === b.suit) {
                return b.value - a.value;
            }
            return ['♠', '♥', '♣', '♦'].indexOf(a.suit) - ['♠', '♥', '♣', '♦'].indexOf(b.suit);
        });
    }
}

class Game {
    constructor() {
        this.players = [
            new Player('北家', 0),
            new Player('东家', 1),
            new Player('南家', 2),
            new Player('西家', 3)
        ];
        this.currentPlayer = 0;
        this.trumpSuit = null;  // 主牌花色
        this.trumpNumber = null;  // 主牌数字
        this.currentRound = [];  // 当前回合打出的牌
        this.level = 2;  // 当前级别，从2开始
    }

    initDeck() {
        const deck = [];
        const suits = ['♠', '♥', '♣', '♦'];
        for (let suit of suits) {
            for (let value = 2; value <= 14; value++) {
                deck.push(new Card(suit, value));
            }
        }
        return this.shuffle(deck);
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealCards() {
        const deck = this.initDeck();
        for (let i = 0; i < deck.length; i++) {
            this.players[i % 4].cards.push(deck[i]);
        }
        this.players.forEach(player => player.sortCards());
    }

    playCard(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.cards[cardIndex];
        
        if (this.isValidPlay(player, card)) {
            this.currentRound.push({
                player: playerIndex,
                card: player.cards.splice(cardIndex, 1)[0]
            });

            if (this.currentRound.length === 4) {
                this.evaluateRound();
            }
            
            return true;
        }
        return false;
    }

    isValidPlay(player, card) {
        if (this.currentRound.length === 0) return true;
        
        const firstCard = this.currentRound[0].card;
        const hasSameSuit = player.cards.some(c => c.suit === firstCard.suit);
        
        if (hasSameSuit && card.suit !== firstCard.suit) return false;
        return true;
    }

    evaluateRound() {
        let winningCard = this.currentRound[0];
        
        for (let i = 1; i < this.currentRound.length; i++) {
            if (this.compareCards(this.currentRound[i].card, winningCard.card)) {
                winningCard = this.currentRound[i];
            }
        }

        this.players[winningCard.player].score += 1;
        this.currentRound = [];
        this.currentPlayer = winningCard.player;
    }

    compareCards(card1, card2) {
        if (this.isTrump(card1) && !this.isTrump(card2)) return true;
        if (!this.isTrump(card1) && this.isTrump(card2)) return false;
        
        if (card1.suit === card2.suit) {
            return card1.value > card2.value;
        }
        
        return false;
    }

    isTrump(card) {
        return card.suit === this.trumpSuit || card.value === this.trumpNumber;
    }
}

// 创建游戏界面
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const game = new Game();
game.dealCards();

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制玩家手牌
    game.players.forEach((player, index) => {
        const x = 50;
        const y = index * 150 + 50;
        
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.fillText(`${player.name} (得分: ${player.score})`, x, y - 20);
        
        player.cards.forEach((card, cardIndex) => {
            ctx.fillStyle = card.selected ? '#aaa' : '#fff';
            ctx.strokeStyle = '#000';
            ctx.fillRect(x + cardIndex * 30, y, 25, 35);
            ctx.strokeRect(x + cardIndex * 30, y, 25, 35);
            
            ctx.fillStyle = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
            ctx.fillText(card.toString(), x + cardIndex * 30 + 5, y + 20);
        });
    });
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检测点击的是哪张牌
    game.players.forEach((player, playerIndex) => {
        const playerY = playerIndex * 150 + 50;
        if (y >= playerY && y <= playerY + 35) {
            const cardIndex = Math.floor((x - 50) / 30);
            if (cardIndex >= 0 && cardIndex < player.cards.length) {
                if (playerIndex === game.currentPlayer) {
                    game.playCard(playerIndex, cardIndex);
                }
            }
        }
    });
    
    drawGame();
});

drawGame();
