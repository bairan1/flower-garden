class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.selected = false;
    }

    toString() {
        const suits = {
            'spade': '♠',
            'heart': '♥',
            'club': '♣',
            'diamond': '♦'
        };
        const ranks = {
            1: 'A',
            11: 'J',
            12: 'Q',
            13: 'K'
        };
        return `${suits[this.suit]}${ranks[this.rank] || this.rank}`;
    }
}

class Player {
    constructor(name, position) {
        this.name = name;
        this.position = position;
        this.cards = [];
        this.team = position % 2; // 0是北南队，1是东西队
        this.tricks = []; // 赢得的牌
    }
}

class Game {
    constructor() {
        this.players = [
            new Player('北方', 0),
            new Player('东方', 1),
            new Player('南方', 2),
            new Player('西方', 3)
        ];
        this.currentLevel = 2; // 从2开始打
        this.dealer = 0; // 庄家位置
        this.currentPlayer = this.dealer; // 当前出牌玩家
        this.trumpSuit = null; // 主牌花色
        this.bottomCards = []; // 底牌
        this.currentTrick = []; // 当前回合打出的牌
        this.scores = [0, 0]; // 两队分数
        this.gamePhase = 'dealing'; // dealing, bidding, playing
        
        this.initGame();
    }

    initGame() {
        // 创建两副牌
        const deck = this.createDeck();
        this.dealCards(deck);
        this.renderGame();
        this.setupEventListeners();
    }

    createDeck() {
        const deck = [];
        const suits = ['spade', 'heart', 'club', 'diamond'];
        // 创建两副牌
        for (let i = 0; i < 2; i++) {
            for (let suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    deck.push(new Card(suit, rank));
                }
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

    dealCards(deck) {
        // 每人25张牌，留8张底牌
        for (let i = 0; i < deck.length - 8; i++) {
            this.players[i % 4].cards.push(deck[i]);
        }
        this.bottomCards = deck.slice(deck.length - 8);
        
        // 整理手牌
        this.players.forEach(player => this.sortCards(player.cards));
    }

    sortCards(cards) {
        const suitOrder = {'spade': 0, 'heart': 1, 'club': 2, 'diamond': 3};
        cards.sort((a, b) => {
            if (a.suit === b.suit) {
                return b.rank - a.rank;
            }
            return suitOrder[a.suit] - suitOrder[b.suit];
        });
    }

    renderGame() {
        // 渲染玩家手牌
        this.players.forEach((player, index) => {
            const container = document.getElementById(`cards-${['north', 'east', 'south', 'west'][index]}`);
            container.innerHTML = '';
            
            player.cards.forEach((card, cardIndex) => {
                const cardElement = document.createElement('div');
                cardElement.className = `card${card.selected ? ' selected' : ''}`;
                cardElement.textContent = card.toString();
                if (['heart', 'diamond'].includes(card.suit)) {
                    cardElement.classList.add('red');
                }
                
                if (index === this.currentPlayer) {
                    cardElement.onclick = () => this.handleCardClick(index, cardIndex);
                }
                
                container.appendChild(cardElement);
            });
        });

        // 渲染当前出牌
        this.currentTrick.forEach(play => {
            const trickCard = document.getElementById(`trick-${['north', 'east', 'south', 'west'][play.player]}`);
            trickCard.textContent = play.card.toString();
            if (['heart', 'diamond'].includes(play.card.suit)) {
                trickCard.classList.add('red');
            }
        });

        // 更新信息面板
        document.getElementById('trump').textContent = this.trumpSuit ? 
            `${this.trumpSuit}${this.currentLevel}` : '等待叫主';
        document.getElementById('current-player').textContent = 
            this.players[this.currentPlayer].name;
        document.getElementById('score-ns').textContent = this.scores[0];
        document.getElementById('score-ew').textContent = this.scores[1];
    }

    handleCardClick(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.cards[cardIndex];

        if (this.gamePhase === 'bidding') {
            this.handleBidding(player, card);
        } else if (this.gamePhase === 'playing') {
            this.handlePlaying(player, card);
        }

        this.renderGame();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.evaluateTrick();
            }
        });
    }
}

// 初始化游戏
const game = new Game();
