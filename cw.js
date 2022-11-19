"use strict";

const LETTER_PLACEHOLDER = '?';
//const LETTER_BLOCKED = '#';

const DIR_ACROSS = 'ACROSS';
const DIR_DOWN = 'DOWN';
//const DIR_BOTH = 'BOTH';

const WORD_STATUS_EMPTY = 1;
const WORD_STATUS_MODIFIED = 2;
//const WORD_STATUS_GOOD = 9;
const WORD_STATUS_DONE = 99;



function Crossword() {
    this.Rows = 0;
    this.Columns = 0;
    this.tableInternal = undefined;
    this.listAcrossDown = [];
}

Crossword.prototype.getClues = function() {
    return this.listAcrossDown;
}

Crossword.prototype.newGame = function() {
    const maxRows = 5;  // default board size
    const maxCols = 13; // default board size
    this.listAcrossDown = [];
    let boardChoice = Math.floor(Math.random() * BOARD_PATTERNS.length);
    this.Rows = Math.min(maxRows, BOARD_PATTERNS[boardChoice].rows);
    this.Columns = Math.min(maxCols, BOARD_PATTERNS[boardChoice].cols);
    // create table and add blanks
    this.tableInternal = new Array(this.Rows);
    for (let i = 0; i < this.Rows; i++) {
	this.tableInternal[i] = new Array(this.Columns);
    }
    for (let i = 0; i < BOARD_PATTERNS[boardChoice].darkcells.length; i++) {
	let r = BOARD_PATTERNS[boardChoice].darkcells[i][0];
	let c = BOARD_PATTERNS[boardChoice].darkcells[i][1];
	if (r < 0 || r >= BOARD_PATTERNS[boardChoice].rows) {
	    alert("bad dark cell - row value " + r + " board choice " + boardChoice + " max rows = " + BOARD_PATTERNS[boardChoice].rows);
	    continue;
	}
	if (c < 0 || c >= BOARD_PATTERNS[boardChoice].cols) {
	    alert("bad dark cell - col value " + c + " board choice " + boardChoice + " max cols = " + BOARD_PATTERNS[boardChoice].cols);
	    continue;
	}
	if (r >= this.Rows) {
	    // display board is smaller than grid pattern
	    continue;
	}
	if (r >= this.Columnss) {
	    // display board is smaller than grid pattern
	    continue;
	}
	//console.log("BOARD_PATTERNS pat=" + pat + " r=" + r + " c=" + c);
	this.tableInternal[r][c] = {'blank': true, 'letter': LETTER_PLACEHOLDER, 'num':0};
    }
    for (let i = 0; i < this.Rows; i++) {
        for (let j = 0; j < this.Columns; j++) {
	    if (this.tableInternal[i][j] == undefined) {
		this.tableInternal[i][j] = {'blank': false, 'letter': LETTER_PLACEHOLDER, 'num':0};
	    }
	}
    }
    // after table is filled with blanks, make list of word positions (ACROSS and DOWN)
    let numAcrossDown = 0;
    const workqueueAcross = [];
    const workqueueDown = [];
    for (let i = 0; i < this.Rows; i++) {
        for (let j = 0; j < this.Columns; j++) {
	    if (this.tableInternal[i][j].blank) {
		continue;
	    }
	    //console.log("i=" + i + " j=" + j + " num=" + this.tableInternal[i][j].num);
	    let lenAcross = 1;
	    while (true) {
		if (j + lenAcross >= this.Columns) {
		    break;  // hit end of column
		}
		if (this.tableInternal[i][j + lenAcross].blank) {
		    break;  // hit a blank cell
		}
		if ((j > 0) && !this.tableInternal[i][j-1].blank) {
		    break;  // cell was already covered by an ACROSS word
		}
		lenAcross += 1;
	    }
	    if (lenAcross > 1) {
		numAcrossDown += 1;
		this.tableInternal[i][j].num = numAcrossDown;
		const rec = initWord(numAcrossDown, DIR_ACROSS, lenAcross, i, j);
		this.listAcrossDown.push(rec);
		workqueueAcross.push(rec);
	    }
	    
	    let lenDown = 1;
	    while (true) {
		if (i + lenDown >= this.Rows) {
		    break;  // hit bottom
		}
		if (this.tableInternal[i + lenDown][j].blank) {
		    break;  // hit a blank cell
		}
		if ((i > 0) && !this.tableInternal[i-1][j].blank) {
		    break;  // cell was already covered
		}
		lenDown += 1;
	    }
	    if (lenDown > 1) {
		if (this.tableInternal[i][j].num == 0) {
		    numAcrossDown += 1;
		    this.tableInternal[i][j].num = numAcrossDown;
		}
		const rec = initWord(numAcrossDown, DIR_DOWN, lenDown, i , j);
		this.listAcrossDown.push(rec);
		workqueueDown.push(rec);
	    }
	}
    }

    // make a directed graph of words
    // NOTE: graph may be (very!) cyclic
    // NOTE: some cells use numbers for both across & down

    // calculate DOWN intersections of ACROSS words
    for (let i=0; i<workqueueAcross.length; i++) {
	//console.log("  workqueueAcross " + workqueueAcross[i].num);
	let item = workqueueAcross[i];
	for (let l=0; l<item.len; l++) {
	    let c = item.col + l;
	    if (l == 0 && item.row == this.rows - 1) {
		continue;
	    }
	    // find upper-most cell of word in each column
	    for (let r=item.row; r>=0; r--) {
		if (r == 0 || this.tableInternal[r-1][c].blank) {
		    //console.log("  ACROSS - row/col [" + r + "," + c + "]");
		    if (this.tableInternal[r][c].num > 0 && r<(this.Rows-1) && !this.tableInternal[r+1][c].blank) {
			//console.log("ACROSS INTERSECT - num=" + item.num + " row/col [" + r + "," + (c+l) + "] down num=" + this.tableInternal[r][c+l].num);
			let num = this.tableInternal[r][c].num;
			//item.cells[l].crosswordNumber = this.tableInternal[r][c].num;
			for (let d=0; d<workqueueDown.length; d++) {
			    if (workqueueDown[d].num == num) {
				item.cells[l].crossword = workqueueDown[d];
				// crossing word is vertical, use its row offset
				item.cells[l].crosswordIndex = item.row - workqueueDown[d].row;
				break;
			    }
			}
		    }
		    break;
		}
	    }
	}
    }
    // calculate ACROSS intersections of DOWN words
    for (let i=0; i<workqueueDown.length; i++) {
	let item = workqueueDown[i];
	//console.log("  workqueueDown " + item.num);
	//console.log("ITEM: " + item);
	for (let l=0; l<item.len; l++) {
	    let r = item.row + l;
	    // find left-most cell of word in each row
	    for (let c=item.col; c >= 0; c--) {
		// move left until outside of table or word
		if (c == 0 || this.tableInternal[r][c-1].blank) {
		    if (this.tableInternal[r][c].num > 0 && c<(this.Columns-1) && !this.tableInternal[r][c+1].blank) {
			//console.log("DOWN INTERSECT - num=" + item.num + " row/col [" + r + "," + c + "]  across num=" + this.tableInternal[r][c].num);
			let num = this.tableInternal[r][c].num;
			for (let a=0; a<workqueueAcross.length; a++) {
			    if (workqueueAcross[a].num == num) {
				item.cells[l].crossword = workqueueAcross[a];
				// crossing word is horizontal, use column offset
				item.cells[l].crosswordIndex = item.col - workqueueAcross[a].col;
				break;
			    }
			}
		    }
		    break;
		}
	    }
	}
    }
    
    // Step 1: find maximally possible characters
    for (let j=0; j<this.listAcrossDown.length; j++) {
	step_Prepare(this, this.listAcrossDown[j]);
    }
    // Step 2: add first word
    workqueueAcross.sort(function(a,b) {return b.len - a.len});
    workqueueDown.sort(function(a,b) {return b.len - a.len});
    step_FirstWord(this, workqueueAcross[0]);
    // Step 3: add remaing words to fill in grid
    while (workqueueAcross.length || workqueueDown.length) {
	if (workqueueDown.length > 0) {
	    let item = workqueueDown.shift();
	    step_AddWord(this, item);
	}
	if (workqueueAcross.length > 0) {
	    let item = workqueueAcross.shift();
	    step_AddWord(this, item);
	}
    }
}


function initWord(num, dir, len, row, col) {
    const rec = {
	'status' : WORD_STATUS_EMPTY,
	'num' : num,
	'dir' : dir,
	'len' : len,
	'row' : row,
	'col' : col,
	'cells' : [],
	'clue' : '[LEN-' + len + ']',
    };
    for (let i = 0; i < len; i++) {
	const letter = {
	    'old' : LETTER_PLACEHOLDER,
	    'crossword' : null,
	    'crosswordIndex' : 0,
	    'possible' : [],	    
	};
	rec.cells.push(letter);
    }

    return rec;
}


function step_Prepare(cw, item) {
    //console.log("step_Prepare() : " + item.num + item.dir  + " row:" + item.row + " col:" + item.col + " len:" + item.len + " status:" + item.status);

    // find candidate words
    const allWords = WORDS[item.len];
    const wordCount = allWords.length;
    if (wordCount == 0) {
	console.log("step_Prepare() : No dictionary matches found: " + item.num + item.dir);
	item.status = WORD_STATUS_EMPTY;
	return false;
    }

    //console.log("step_Prepare() : #words:", wordCount);
    
    for (let w=0; w<wordCount; w++) {
	const word = allWords[w];
	//console.log("step_Prepare()" + item.num + item.dir + "  word:", word.word);
	for (let i=0; i<item.len; i++) {
	    const ch = word.word[i];
	    if (item.cells[i].possible.indexOf(ch) < 0) {
		item.cells[i].possible.push(ch);
	    }
	}
    }
    /****
    console.log("step_Prepare() : " + item.num + item.dir);
    for (let i=0; i<item.len; i++) {
	console.log("    : possible chars[" + i + "] = " + item.cells[i].possible);
    }
    ***/
}

function step_Intersect(cw, item) {
    //console.log("wordFillNegotiate() : " + item.num + item.dir  + " row:" + item.row + " col:" + item.col + " len:" + item.len + " status:" + item.status);

    for (let i=0; i<item.len; i++) {
	const crossword = item.cells[i].crossword;
	if (crossword == null) continue;
	const xc = item.cells[i].crosswordIndex;
	//console.log("  -- crossword[" + i + "] : " + crossword.num + crossword.dir  + " row:" + crossword.row + " col:" + crossword.col + " len:" + crossword.len + " xc:" + xc);
	//console.log("    : possible chars[" + i + "] = " + item.cells[i].possible);
	//console.log("    : crossword chars   = " + crossword.cells[xc].possible);
	const intersection = charIntersection(item.cells[i].possible, crossword.cells[xc].possible);
	//console.log("    : intersection      = " + intersection);
	item.cells[i].possible = intersection;
	crossword.cells[xc].possible = intersection;
    }
}

function charIntersection(chars1, chars2) {
    //console.log("charIntersection() chars1: " + chars1);
    //console.log("charIntersection() chars2: " + chars2);
    const sharedChars = [];

    for (let i=0; i<chars1.length; i++) {
	const ch = chars1[i];
	// push char if it appears in both
	if (chars2.indexOf(ch) >= 0) {
	    sharedChars.push(ch);
	}
    }
    //console.log("charIntersection() sharedChars: " + sharedChars);
    return sharedChars;
}

function step_FirstWord(cw, item) {
    //console.log("step_FirstWord() : " + item.num + item.dir  + " row:" + item.row + " col:" + item.col + " len:" + item.len + " status:" + item.status);

    for (let i=0; i<item.len; i++) {
	const crossword = item.cells[i].crossword;
	if (crossword == null) continue;
	const xc = item.cells[i].crosswordIndex;
	//console.log("  -- crossword[" + i + "] : " + crossword.num + crossword.dir  + " row:" + crossword.row + " col:" + crossword.col + " len:" + crossword.len + " xc:" + xc);
	//console.log("    : possible chars[" + i + "] = " + item.cells[i].possible);
	//console.log("    : crossword chars   = " + crossword.cells[xc].possible);
	const intersection = charIntersection(item.cells[i].possible, crossword.cells[xc].possible);
	//console.log("    : intersection      = " + intersection);
	item.cells[i].possible = intersection;
    }

    const allMatchingWords = findWords_FirstWord(cw, item);
    const wordCount = allMatchingWords.length;
    if (wordCount == 0) {
	//console.log("step_FirstWord() : No Match found: " + item.num + item.dir);
	item.status = WORD_STATUS_EMPTY;
	return false;
    }

    //console.log("step_FirstWord() : #words:", wordCount);

    // start at random position of matches
    let matchPosition = Math.floor(Math.random() * allMatchingWords.length);
    for (let i=0; i<item.len; i++) {
	item.cells[i].possible
    }
    placeWord(cw, item, allMatchingWords[matchPosition]);
    item.clue = allMatchingWords[matchPosition].clue;
    return true;
}


function step_AddWord(cw, item) {
    //console.log("step_AddWord() : " + item.num + item.dir  + " row:" + item.row + " col:" + item.col + " len:" + item.len + " status:" + item.status);

    for (let i=0; i<item.len; i++) {
	const crossword = item.cells[i].crossword;
	if (crossword == null) continue;
	const xc = item.cells[i].crosswordIndex;
	//console.log("  -- crossword[" + i + "] : " + crossword.num + crossword.dir  + " row:" + crossword.row + " col:" + crossword.col + " len:" + crossword.len + " xc:" + xc);
	//console.log("    : possible chars[" + i + "] = " + item.cells[i].possible);
	//console.log("    : crossword chars   = " + crossword.cells[xc].possible);
	const intersection = charIntersection(item.cells[i].possible, crossword.cells[xc].possible);
	//console.log("    : intersection      = " + intersection);
	item.cells[i].possible = intersection;
    }

    let pat = '^';
    let r = item.row;
    let c = item.col;
    for (let i = 0; i < item.len; i++) {
	//console.log("  pat=" + pat);
	//clone[i].clue = "Clue " + clone[i].num;
	let ch = cw.tableInternal[r][c].letter;
	if (ch == LETTER_PLACEHOLDER) {
	    let chars = item.cells[i].possible;
	    pat += '[';
	    for (let c = 0; c < chars.length; c++) {
		pat += chars[c];
	    }
	    pat += ']';
	} else {
	    pat += ch;
	}
	if (item.dir == DIR_ACROSS) {
	    c += 1;
	} else if (item.dir == DIR_DOWN) {
	    r += 1;
	} else {
	    console.log("findwords_Extra() ERROR - unknown direction " + item.dir);
	}
    }

    //console.log(" pat=" + pat);
    
    let matches = [];
    let re = new RegExp(pat + '$');
    for (let i = 0; i < WORDS[item.len].length; i++) {
	let result = WORDS[item.len][i].word.match(re);
	if (result) {
	    //console.log("  " + WORDS[item.len][i].word + " CLUE=" + WORDS[item.len][i].clue);
	    matches.push(WORDS[item.len][i]);
	}
    }

    const wordCount = matches.length;
    if (wordCount == 0) {
	//console.log("step_AddWord() : No Match found: " + item.num + item.dir);
	item.status = WORD_STATUS_EMPTY;
	fixWord(cw, item);
	return false;
    }

    //console.log("step_AddtWord() : #words:", wordCount);

    // start at random position of matches
    let matchPosition = Math.floor(Math.random() * matches.length);
    placeWord(cw, item, matches[matchPosition]);
    item.clue = matches[matchPosition].clue;
    return true;
}


function fixWord(cw, item) {
    console.log("fixWord() item=" + item.num + item.dir + " row:" + item.row + " col:" + item.col + " len:" + item.len);

    for (let i=0; i<item.len; i++) {
	const crossword = item.cells[i].crossword;
	const xc = item.cells[i].crosswordIndex;
	if (crossword == null) {
	    //pat += cw.tableInternal[r][c].letter;
	    continue;
	}
	let pat = "";
	let patCross = "";
	let r = item.row;
	let c = item.col;
	if (item.dir == DIR_ACROSS) {
	    console.log("  || crossword[" + i + "] : " + crossword.num + crossword.dir  + " row:" + crossword.row + " col:" + crossword.col + " len:" + crossword.len);
	    for (let k=0; k<item.len; k++) {
		if (k == i) {
		    pat += '#';
		} else {
		    pat += cw.tableInternal[r][c+k].letter;
		}
	    }
	    for (let k=0; k<crossword.len; k++) {
		if (k == xc) {
		    patCross += '#';
		} else {
		    patCross += cw.tableInternal[crossword.row+k][crossword.col].letter;
		}
	    }
	} else if (item.dir == DIR_DOWN) {
	    console.log("  -- crossword[" + i + "] : " + crossword.num + crossword.dir  + " row:" + crossword.row + " col:" + crossword.col + " len:" + crossword.len);
	    for (let k=0; k<item.len; k++) {
		if (k == i) {
		    pat += '#';
		} else {
		    pat += cw.tableInternal[r+k][c].letter;
		}
	    }
	    for (let k=0; k<crossword.len; k++) {
		if (k == xc) {
		    patCross += '#';
		} else {
		    patCross += cw.tableInternal[crossword.row][crossword.col+k].letter;
		}
	    }
	}
	//console.log("  item pat=" + pat + "  cross pat=" + patCross);
	let rePat = '^';
	let rePatPos;
	for (let p=0; p<pat.length; p++) {
	    if (pat[p] == '#') {
		rePatPos = p;
		rePat += '[A-Z]';
	    } else if (pat[p] == '?') {
		rePat += '[A-Z]';
	    } else {
		rePat += pat[p];
	    }
	}
	rePat += '$';
	let matches = [];
	let re = new RegExp(rePat);
	for (let i = 0; i < WORDS[item.len].length; i++) {
	    let result = WORDS[item.len][i].word.match(re);
	    if (result) {
		//console.log("  " + WORDS[item.len][i].word);
		matches.push(WORDS[item.len][i]);
	    }
	}	
	//const wordCount = matches.length;
	console.log("  rePat=" + rePat + " # = " + matches.length);

	if (matches.length == 0) continue;

	let charsIntersection = "";
	for (let m=0; m<matches.length; m++) {
	    //let rec = matches.pop();
	    let rec = matches[m];
	    let ch = rec.word.charAt(rePatPos);
	    //console.log("  match " + m + " word: " + rec.word + " ch: " + ch);
	    if (charsIntersection.indexOf(ch) < 0) {
		charsIntersection += ch;
	    }
	}
	//console.log("  > charsIntersection: " + charsIntersection);
	
	let rePatCross = '^';
	for (let p=0; p<patCross.length; p++) {
	    if (patCross[p] == '#') {
		rePatCross += '[' + charsIntersection + ']';
	    } else if (patCross[p] == '?') {
		rePatCross += '[A-Z]';
	    } else {
		rePatCross += patCross[p];
	    }
	}
	rePatCross += '$';
	let matchesCross = [];
	let reCross = new RegExp(rePatCross);
	for (let m=0; m < WORDS[item.len].length; m++) {
	    let result = WORDS[item.len][m].word.match(reCross);
	    if (result) {
		//console.log("  " + WORDS[item.len][i].word);
		matchesCross.push(WORDS[item.len][m]);
	    }
	}	
	//const wordCount = matches.length;
	console.log("  rePatCross=" + rePatCross + " # = " + matchesCross.length);

	// get pair of acceptable words
	for (let m=0; m<matches.length; m++) {
	    let rec = matches[m];
	    let ch = rec.word.charAt(rePatPos);
	    for (let k=0; k<matchesCross.length; k++) {
		if ((k == xc) && (ch == matchesCross.charAt(k))) {
		    console.log("  new word =" + rec.word + " new cross = " + matchesCross[k].word);
		    return true;
		}
	    }
	}
    }
    return false;
}


function placeWord(cw, item, newWord) {
    // place word in crossword
    let r = item.row;
    let c = item.col;
    for (let i = 0; i < item.len; i++) {
        //console.log("placeWord() : r:" + r + " c:" + c);
        cw.tableInternal[r][c].letter = newWord.word[i];
        if (item.dir == DIR_ACROSS) {
            c += 1;
        } else if (item.dir == DIR_DOWN) {
            r += 1;
        }
    }
}


function findWords_FirstWord(cw, item) {
    //console.log("findWords_FirstWord() item=" + item.num + item.dir);
    let pat = '^';
    let r = item.row;
    let c = item.col;
    for (let i = 0; i < item.len; i++) {
	let chars = item.cells[i].possible;
	//console.log("  possible chars (len=" + chars.length + ") : " + chars);
	pat += '[';
	for (let c = 0; c < chars.length; c++) {
	    pat += chars[c];
	}
	pat += ']';
    }
    //console.log("findWords_FirstWord: pat=" + pat);
    
    let matches = [];
    let re = new RegExp(pat + '$');
    for (let i = 0; i < WORDS[item.len].length; i++) {
	let result = WORDS[item.len][i].word.match(re);
	if (result) {
	    //console.log("  " + WORDS[item.len][i].word + " CLUE=" + WORDS[item.len][i].clue);
	    matches.push(WORDS[item.len][i]);
	}
    }
    //console.log("findWords_FirstWord: item=" + item.num + item.dir + " #matches=" + matches.length);

    return matches;
}
