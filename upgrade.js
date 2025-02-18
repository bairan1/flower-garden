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
        this.trumpSuit = null;
        this.trumpRank = null;
        this.currentPlayer = 0;
        this.currentTrick = [];
        this.scores = [0, 0];  // 两队分数
        this.initGame();
    }

    initGame() {
        // 生成两副牌
        const deck = [];
        const suits = ['♠', '♥', '♣', '♦'];
        for (let i = 0; i < 2; i++) {
            for (let suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    deck.push(new Card(suit, rank));
                }
            }
            // 添加大小王
            deck.push(new Card(null, 16, true));  // 大王
            deck.push(new Card(null, 15, true));  // 小王
        }
        
        // 洗牌
        this.shuffle(deck);
        
        // 发牌
        for (let i = 0; i < deck.length; i++) {
            this.players[i % 4].cards.push(deck[i]);
        }
        
        // 整理手牌
        this.players.forEach(player => this.sortCards(player.cards));
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    sortCards(cards) {
        cards.sort((a, b) => {
            if (a.isJoker && b.isJoker) return b.rank - a.rank;
            if (a.isJoker) return -1;
            if (b.isJoker) return 1;
            if (a.suit === b.suit) return a.rank - b.rank;
            return ['♠', '♥', '♣', '♦'].indexOf(a.suit) - ['♠', '♥', '♣', '♦'].indexOf(b.suit);
        });
    }
}
