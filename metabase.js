var pins = document.createElement('style');
pins.setAttribute("type", "text/css");
document.getElementsByTagName('head').item(0).appendChild(pins);
var pinss = pins.sheet;

pinss.insertRule('tr:hover { background-color:mediumblue; opacity:0.8; color:white; }', pinss.cssRules.length);

//status
pinss.insertRule('tr[row-status="destructed"] { background-color:silver; opacity:0.6; }', pinss.cssRules.length);
pinss.insertRule('tr[row-status="putoff"] { background-color:lightgrey; opacity:0.6; }', pinss.cssRules.length);

//due_date
pinss.insertRule('tr[row-status="open"][row-style="over"] { color:red; }', pinss.cssRules.length);
pinss.insertRule('tr[row-status="open"][row-style="today"] { color:blue; }', pinss.cssRules.length);

//retrospective
pinss.insertRule('span[col-style="over"] { color:red; }', pinss.cssRules.length);
pinss.insertRule('span[col-style="before"] { color:blue; }', pinss.cssRules.length);



var retryCount = 0;
var intervalId = setInterval(findElementForWait , 1000);

function findElementForWait(){
    retryCount++;
    if(retryCount > 10){
       clearInterval(intervalId);
    }
    var td = document.querySelector('table.CtorL td');
    if(td){
       clearInterval(intervalId);
       addRowAttribute();
       bindPagingEvent();
    }
}

function toStr(date){
    var information = {};
    information.yyyy = String(date.getFullYear());
    information.mm = String(date.getMonth() + 1);
    information.dd = String(date.getDate());
    if (information.mm < 10) {
        information.mm = '0' + information.mm;
    }
    if (information.dd < 10) {
        information.dd = '0' + information.dd;
    }
    return information.yyyy + '/' + information.mm + '/' + information.dd;
}

function checkColAttribute(row, today, preRowinfo){
    console.log('checkColAttribute' + row);
    var cols = row.querySelectorAll('span');
    var rowinfo = {};
    rowinfo['count'] = cols.length;
    
    var colIdx = 0;
    cols.forEach(
        function(col){
            var text = col.textContent;
            if(text === '破棄'){
                row.setAttribute('row-status','destructed');
            } else if(text === '先送り'){
                row.setAttribute('row-status','putoff');
            } else if(text === '完了'
                   || text === 'テスト完了'
                   || text === '評価完了'){
                row.setAttribute('row-status','complete');
            } else if(text === '新規'
                   || text === '着手'
                   || text === '対応済'
                   || text === '開発中'
                   || text === '開発完了'
                   || text === '開発確認済み'
                   || text === '評価中'){
                row.setAttribute('row-status','open');
            }
            var date = text.match(/[0-9][0-9][0-9][0-9][\/][0-9][0-9][\/][0-9][0-9]/);
            if(date){
                if(text === today){
                    row.setAttribute('row-style','today');
                }
                if(text < today){
                    row.setAttribute('row-style','over');
                }
                if(rowinfo[0] === ''
                   && preRowinfo[colIdx] 
                   && preRowinfo[colIdx] !== '-'){
                    if(preRowinfo[colIdx] < text){
                        col.setAttribute('col-style','over');
                    } else if(preRowinfo[colIdx] > text){
                        col.setAttribute('col-style','before');
                    }
                }
            }
            rowinfo[colIdx] = text;
            colIdx++;
        }
    )
    
    return rowinfo;
}

function addRowAttribute(){
    console.log('addRowAttribute');
    var today = toStr(new Date());
    var rows = document.querySelectorAll('tr');
    var rowinfo = {};
    rows.forEach(
        function(row){
            rowinfo = checkColAttribute(row,today,rowinfo);
        }
    )
}

function bindPagingEvent(){
    var pagings = document.querySelectorAll('div.p1.flex.flex-no-shrink.flex-align-right');
    pagings.forEach(
        function(paging){
            paging.addEventListener('click' , callFunction);
        }
    )
    function callFunction(){
        setTimeout(addRowAttribute, 500);
    }
}
