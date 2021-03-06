var pins = document.createElement('style');
pins.setAttribute("type", "text/css");
document.getElementsByTagName('head').item(0).appendChild(pins);
var pinss = pins.sheet;

pinss.insertRule('tr:hover { background-color:Yellow; opacity:0.8; color:white; }', pinss.cssRules.length);

//status
pinss.insertRule('tr[row-status="destructed"] { background-color:silver; opacity:0.6; }', pinss.cssRules.length);
pinss.insertRule('tr[row-status="putoff"] { background-color:lightgrey; opacity:0.6; }', pinss.cssRules.length);

//due_date
pinss.insertRule('tr[row-status="open"][row-style="over"] td { color:red; }', pinss.cssRules.length);
pinss.insertRule('tr[row-status="open"][row-style="today"] td { color:blue; }', pinss.cssRules.length);

//retrospective
pinss.insertRule('span[col-style="over"] { color:red; }', pinss.cssRules.length);
pinss.insertRule('span[col-style="before"] { color:blue; }', pinss.cssRules.length);
pinss.insertRule('span[col-diff="over"] { color:red; }', pinss.cssRules.length);
pinss.insertRule('span[col-diff="before"] { color:blue; }', pinss.cssRules.length);

if(checkTitle('Alert')){
    pinss.insertRule('div.DashboardGrid.tanto>div.DashCard { height:500px !important; top:0 !important; position:relative !important; }', pinss.cssRules.length);
}

var retryCount = 0;
var findElemIntervalId = setInterval(findElementForWait , 1000);

function checkTitle(title){
    var result = false;
    var header = document.querySelector('div.EmbedFrame-header');
    if(header){
        header.querySelectorAll('div').forEach(
            function(div){
                if(div.textContent.indexOf(title) > 0){
                    result = true;
                }
            }
        );
    }
    return result;
}

function findElementForWait(){
    retryCount++;
    if(retryCount > 60){
        clearInterval(findElemIntervalId);
        findElemIntervalId = -1;
    }
    var nowloading = document.querySelector('div.LoadingSpinner');
    if(!nowloading){
        var wait = document.querySelector('.h4.text-bold.mb1');
        if(!wait || wait.textContent != '待機中...'){
            clearInterval(findElemIntervalId);
            findElemIntervalId = -1;
            addRowAttribute();
            bindPagingEvent();
        }
    }
    console.log('wait loading...')
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

function checkColAttribute(row, today, preRowinfo, headerinfo){
    var cols = row.querySelectorAll('span');
    var rowinfo = {};
    rowinfo['count'] = cols.length;
    
    var status = '';
    var colIdx = 0;
    cols.forEach(
        function(col){
            var text = col.textContent;
            status = judgeStatus(text, status);
            
            var date = text.match(/[0-9]{2,4}[\/][0-9][0-9][\/][0-9][0-9]/);
            if(date && text.length <= 10){
                var todaystr = today;
                if(text.length === 8){
                    todaystr = todaystr.substr(2);
                }
                if(text === todaystr){
                    row.setAttribute('row-style','today');
                }
                if(text < todaystr){
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
            if(headerinfo['colname'][colIdx] === 'diff'){
                if(text.indexOf('-') >= 0){
                    col.setAttribute('col-diff','before');
                } else if(text !== '0'){
                    col.setAttribute('col-diff','over');
                }
            }
            rowinfo[colIdx] = text;
            colIdx++;
        }
    )
    row.setAttribute('row-status',status);

    return rowinfo;
}
function judgeStatus(text, status){
    if(status != ''){
        return status;
    }
    if(text === '破棄'
      || text === 'Destructed'){
        return 'destructed';
    } else if(text === '先送り'
             || text === 'PutOff'){
        return 'putoff';
    } else if(text === '完了'
           || text === 'テスト完了'
           || text === '評価完了'
           || text === '済'
           || text === 'Closed'
           || text === 'Tested'
           || text === 'Evaluated'){
        return 'complete';
    } else if(text === '新規'
           || text === '着手'
           || text === '対応済'
           || text === '開発中'
           || text === '開発完了'
           || text === '開発確認済み'
           || text === '評価中'
           || text === 'New'
           || text === 'In progress'
           || text === 'Resolved'
           || text === 'Developing'
           || text === 'Developed'
           || text === 'Develop Confirmed'
           || text === 'Evaluating'){
        return 'open';
    }
    return '';
}

function addRowAttribute(){
    console.log('addRowAttribute');
    var today = toStr(new Date());
    var tables = document.querySelectorAll('table');
    var rowinfo = {};
    tables.forEach(
        function(table){
            var headers = table.querySelectorAll('thead > tr > th > div > div');
            var headerinfo = {};
            headerinfo['colname'] = {};
            let index = 0;
            headers.forEach(
                function(header){
                    headerinfo['colname'][index] = header.textContent;
                    index++;
                    console.log(header.textContent);
                }
            )
            var rows = table.querySelectorAll('tbody > tr');
            rows.forEach(
                function(row){
                    rowinfo = checkColAttribute(row,today,rowinfo,headerinfo);
                }
            )
        }
    )
    var tanto = document.querySelector('input[placeholder="Tanto"]');
    if (tanto){
        var dashbord = document.querySelector('div.DashboardGrid');
        if (dashbord) {
            if(tanto.value !== 'ALL'){
                dashbord.classList.add('tanto');
            } else {
                dashbord.classList.remove('tanto');
            }
        }
    }
}

function bindPagingEvent(){
    var pagings = document.querySelectorAll('div.p1.flex.flex-no-shrink.flex-align-right');
    pagings.forEach(
        function(paging){
            paging.addEventListener('click' , callFunctionClick);
        }
    )
    var inputs = document.querySelectorAll('input[placeholder=Tanto], input[placeholder=Version], input[placeholder=MyTaskOnly]');
    inputs.forEach(
        function(input){
            input.addEventListener('keyup' , callFunctionKeyup);
        }
    )
    function callFunctionClick(){
        setTimeout(addRowAttribute, 500);
    }
    function callFunctionKeyup(event){
        if(event && event.key === 'Enter'){
            if(findElemIntervalId < 0){
                findElemIntervalId = setInterval(findElementForWait , 1000);
            }
        }
    }
}
