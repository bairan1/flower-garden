class Card {
    constructor(suit, rank, isJoker = false) {
        this.suit = suit;  // 花色：♠♥♣♦
        this.rank = rank;  // 点数：1-13 (1是A)
        this.isJoker = isJoker;  // 是否是王牌
        this.isSelected = false;
    }

    toString() {
        if (this.isJoker) {
            return this.rank === 16 ? '大王' : '小王';
        }
        const ranks = {
            1: 'A', 11: 'J', 12: 'Q', 13: 'K'
        };
        return `${this.suit}${ranks[this.rank] || this.rank}`;
    }
}

class Player {
    constructor(name, position, isAI = false) {
        this.name = name;
        this.position = position;  // 0-北 1-东 2-南 3-西
        this.cards = [];
        this.team = position % 2;  // 0队或1队
        this.isAI = isAI;
        this.hiddenCards = [];  // 扣牌
    }
}

class Game {
    constructor() {
        this.players = [
            new Player('北方', 0),
            new Player('东方', 1, true),
            new Player('南方', 2),
            new Player('西方', 3, true)
        ];
        this.currentPlayer = 0;
        this.currentPhase = 'bidding'; // bidding, playing
        this.trumpSuit = null;
        this.trumpRank = null;
        this.scores = [0, 0]; // 北南队、东西队的分数
        this.currentTrick = [];
        this.initGame();
        this.renderGame();
    }

    initGame() {
        const deck = this.createDeck();
        this.dealCards(deck);
        this.updateUI();
    }

    createDeck() {
        const deck = [];
        const suits = ['♠', '♥', '♣', '♦'];
        // 创建两副牌
        for (let i = 0; i < 2; i++) {
            for (let suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    deck.push(new Card(suit, rank));
                }
            }
            // 添加大小王
            deck.push(new Card('', 16, true)); // 大王
            deck.push(new Card('', 15, true)); // 小王
        }
        return this.shuffle(deck);
    }

    renderGame() {
        // 渲染玩家手牌
        this.players.forEach((player, index) => {
            const container = document.getElementById(`cards-${['north', 'east', 'south', 'west'][index]}`);
            container.innerHTML = '';
            
            player.cards.forEach((card, cardIndex) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card' + (card.isSelected ? ' selected' : '');
                cardElement.textContent = card.toString();
                if (['♥', '♦'].includes(card.suit)) {
                    cardElement.style.color = 'red';
                }
                
                // 只有当前玩家的牌可以点击
                if (index === this.currentPlayer) {
                    cardElement.onclick = () => this.handleCardClick(index, cardIndex);
                }
                
                container.appendChild(cardElement);
            });
        });

        // 更新信息面板
        document.getElementById('trump').textContent = this.trumpSuit ? `${this.trumpSuit}${this.trumpRank}` : '等待叫主';
        document.getElementById('current-player').textContent = this.players[this.currentPlayer].name;
        document.getElementById('score-ns').textContent = this.scores[0];
        document.getElementById('score-ew').textContent = this.scores[1];
    }

    handleCardClick(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.cards[cardIndex];

        if (this.currentPhase === 'bidding') {
            // 叫主阶段
            if (this.canBid(card)) {
                this.trumpSuit = card.suit;
                this.trumpRank = card.rank;
                this.currentPhase = 'playing';
                if (card.isJoker) {
                    player.hiddenCards.push(...player.cards.splice(cardIndex, 1));
                }
            }
        } else {
            // 出牌阶段
            if (this.isValidPlay(player, card)) {
                this.playCard(playerIndex, cardIndex);
            }
        }

        this.renderGame();
    }
}

// 初始化游戏
const game = new Game();

// 添加键盘控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // 空格键结束当前回合
        game.endTrick();
    }
});
