app.EnableBackKey(false);
app.SetOrientation( "Portrait" )
app.SetBackColor( "#ffffff" );
var shedule = {
  "Понедельник":["Классный час","История","Химия","Литература","ОБЖ","Биология"],
  "Вторник":["Английский язык","География","Литература","Физика","Алгебра","Английский язык","Геометрия"],
  "Среда":["Русский язык","Информатика","Русский язык","Литература","Алгебра","История","Алгебра"],
  "Четверг":["Башкирский язык","Литература","Физкультура","Физкультура","Физика","Английский язык","Геометрия"],
  "Пятница":["Обществознание","География","Химия","Биология","Алгебра","Алгебра","Физика"],
  "Суббота":[],
  "Воскресенье":[]
}
_LoadScriptSync( "crypto.js");
_LoadScriptSync( "textapi.js" );
_LoadScriptSync( "axios.js" );
function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx)
}
var date = new Date();
var DzManager = new ProtectedTextApi( "dzdb", "pass" );
var day = date.getDay()-1;
if ( day < 0 ) day = 6;
var rings = {480:true, 520:false, 525:true, 565:false, 580:true, 620:false, 635:true, 675:false, 690:true, 730:false, 735:true, 775:false, 780:true, 820:false};
var nrings = Object.keys(rings).filter(function(value, index, Arr) {
  return index % 1 == 0;
});
var dfltLst = [];
d = date.getDate();
shed = Object.keys(shedule);
function t(x, i) {
  p = i;
  if ( i < day ) {
    p = i+7-day;
  } else if ( i == day ) {
    p = 0;
  } else {
    p = i-day;
  }
  dfltLst.push( x+" ["+(d+p)+"]" )
}
shed.forEach((x, i) => t(x, i))
dfltLst = dfltLst.join(",")
var data = JSON.parse(app.LoadText( "data", JSON.stringify({
  "Классный час":["354", []],
  "История":["302", []],
  "Химия":["446", []],
  "Литература":["318", []],
  "ОБЖ":["158", []],
  "Биология":["446", []],
  "Английский язык":["266/267", []],
  "География":["317", []],
  "Физика":["263", []],
  "Алгебра":["302", []],
  "Геометрия":["302", []],
  "Русский язык":["318", []],
  "Информатика":["338/356", []],
  "Башкирский язык":["220/401", []],
  "Физкультура":["253", []],
  "Обществознание":["302", []]
}) ));

function Online( is = false ) {
  online = window.navigator.onLine;
  if ( is && !online ) {
    app.Alert( "Изменения сохранены локально, подключение к интернету не стабильно!", "Предупреждение" );
  }
  return online;
}
var months=[
   "января",
   "февраля",
   "марта",
   "апреля",
   "мая",
   "июня",
   "июля",
   "августа",
   "сентября",
   "октября",
   "ноября",
   "декабря"
];

function LoadDZ(day) {
  dz = [[], []];
  for ( i in shedule[day] ) {
    c1 = GetClosest(i)
    c2 = GetClosest(i, 1)
    i = shedule[day][i];
    dz[0].push(i+" ["+data[i][0]+"] ("+((c1[0].length == 1?"0":"")+c1[0]+"."+(c1[1].length == 1?"0":"")+c1[1])+" - "+((c2[0].length == 1?"0":"")+c2[0]+"."+(c2[1].length == 1?"0":"")+c2[1])+")");
    dzstr = [[], []];
    for ( dn in data[i][1] ) {
      d = data[i][1][dn];
      if ( date.getMonth() >= d.month && date.getDate() > d.day ) {
        data[i][1].splice(d, 1);
      } else {
        dzstr[0].push("До "+d.day+" "+months[d.month]);
        dzstr[1].push(d.text);
      }
    }
    dz[1].push(dzstr);
  }
  dz[0] = dz[0].join(",");
  return dz;
}

function GetClosest( tm = "none", ind = 0 ) {
  if ( tm != "none" ) {
    if ( ind == 0 ) {
      closest = Object.keys(rings)[tm*2];
    } else {
      closest = Object.keys(rings)[tm*2+1];
    }
    hour = String(Math.floor(closest/60));
    minute = String(closest-Math.floor(closest/60)*60);
    return [hour, minute];
  } else {
    var date = new Date();
    var day = date.getDay()-1;
    if ( day < 0 ) day = 6;
    goal = date.getHours()*60+date.getMinutes();
  }
  closest = Object.keys(rings).reduce(function(prev, curr) {
    return (prev <= goal ? curr : prev);
  });
  next = closest - goal;
  if ( goal >= Object.keys(rings)[Object.keys(rings).length-1] ) {
    closest = Object.keys(rings)[0];
    next = 1440 + closest - goal;
  }
  if ( next > 99 ) {
    if ( day >= 4 && day < 6 ) {
      TimeBtn.SetText( "Завтра нет уроков!" );
    } else {
      TimeBtn.SetText( "Ещё много времени!" );
    }
  } else {
    TimeBtn.SetText( "Минут до "+(rings[closest]?"начала":"конца")+" урока: "+ next );
  }
  if ( MainLst.GetItemByIndex( 0 ).title.split(" ")[0] != "Понедельник" ) {
    MainLst.SelectItemByIndex( parseInt(Object.keys(rings).indexOf(closest)/2) );
  } else {
    MainLst.SelectItemByIndex( day );
  }
  return closest;
}

async function OnStart() {
  PrimeLay = app.CreateLayout( "Absolute", "FillXY" );
  MainLay = app.CreateLayout( "Absolute", "FillXY" );
  LoadLay = app.CreateLayout( "Linear", "VCenter,FillXY" );
  LoadLay.SetBackColor( "#ffffff" );
  LogoImg = app.CreateImage( "Img/ArtSchool.png", 0.5, -1 );
  LoadLay.AddChild( LogoImg );
  LogoTxt = app.CreateText( "ArtSchool", 0.5, -1 );
  LogoTxt.SetTextColor( "#000000" );
  LogoTxt.SetTextSize( 20, "pl" );
  LoadLay.AddChild( LogoTxt );
  PrimeLay.AddChild( MainLay );
  PrimeLay.AddChild( LoadLay );
  app.AddLayout( PrimeLay );
  if ( Online(true) ) {
    data = JSON.parse(await DzManager.view());
  }
  MainLst = app.CreateList( dfltLst, 0.9, 0.7, "Bold,AlumButton" );
  MainLst.SetTextColor( "#000000" );
  MainLst.SetBackColor( "#EFEFEF" );
  MainLst.SetTextSize( 20, "pl" );
  MainLst.SetPosition( 0.05, 0.05 );
  MainLst.SetOnTouch( function (title, body, image, index) {
    title = title.split(" ")[0]
    if ( MainLst.GetItemByIndex( 0 ).title.split(" ")[0] == "Понедельник" ) {
      if ( shedule[title].length == 0 ) {
        app.Alert( "Уроки отсутствуют!\nСделал: Рамазанов Артём", "Внимание" );
      } else {
        MainLst.SetList(LoadDZ(title)[0]);
        GetClosest();
      }
    } else {
      ShowAssetsDialog( function (txt, indx) {
        app.Alert( dz[1][index][1][indx], "Домашнее задание" );
      }, "Выбери задание", dz[1][index][0].join(","), function (txt, indx) {
        ynDlg = app.CreateYesNoDialog( "Удалить ДЗ за"+(txt.substring(2))+"?" );
        ynDlg.SetButtonText( "Да", "Нет" );
        ynDlg.SetOnTouch( async function (del) {
          if ( del == "Yes" ) {
            app.ShowProgress( "Удаление ДЗ..." );
            if ( Online(true) ) {
              data = JSON.parse(await DzManager.view());
            }
            dz[1][index][0].splice(indx, 1);
            dz[1][index][1].splice(indx, 1);
            data[title][1].splice(indx, 1);
            app.SaveText( "data", JSON.stringify( data ) );
            if ( Online() ) {
              await DzManager.save( JSON.stringify( data ) );
            }
            app.HideProgress();
            app.ShowPopup( "Успешно удалено!", "bottom" );
          }
        } );
        ynDlg.Show();
      }, false );
    }
  } );
  MainLay.AddChild( MainLst );
  RenewBtn = app.CreateButton( "Перезагрузить дз", 0.9, -1, "Custom,Singleline" );
  RenewBtn.SetOnTouch( async function () {
    app.ShowProgress( "Получение данных..." );
    if ( Online() ) {
      data = JSON.parse(await DzManager.view());
      app.Alert( "Датабаза перезагружена!", "Успешно" );
    } else {
      app.Alert( "Не удалось подключится к датабазе, подключение к интернету не стабильно!", "Ошибка" );
    }
    app.HideProgress();
  } );
  RenewBtn.SetStyle( "#4285F4", "#4285F4", 4 );
  RenewBtn.SetPosition( 0.05, 0.76 );
  RenewBtn.SetTextSize( 20, "pl" );
  MainLay.AddChild( RenewBtn );
  TimeBtn = app.CreateButton( "Загрузка времени...", 0.9, -1, "Custom,Singleline" );
  GetClosest();
  TimeBtn.SetOnTouch( function () {
    closest = GetClosest();
    hour = String(Math.floor(closest/60));
    minute = String(closest-Math.floor(closest/60)*60);
    app.Alert( (rings[closest]?"Начало":"Конец")+" урока в "+(hour.length == 1?"0":"")+hour+":"+(minute.length == 1?"0":"")+minute)
  } );
  TimeBtn.SetStyle( "#4285F4", "#4285F4", 4 );
  TimeBtn.SetPosition( 0.05, 0.83 );
  TimeBtn.SetTextSize( 20, "pl" );
  MainLay.AddChild( TimeBtn );
  DzBtn = app.CreateButton( "Добавить ДЗ", 0.9, -1, "Custom" );
  DzBtn.SetOnTouch( function () {
    ShowTextDialog( "Запись ДЗ", "", async function (shed, month, day, text) {
      app.ShowProgress( "Добавление ДЗ..." );
      if ( Online(true) ) {
        data = JSON.parse(await DzManager.view());
      }
      data[shed][1].push( {"text":text, "day":day, "month":month} );
      app.SaveText( "data", JSON.stringify( data ) );
      if ( Online() ) {
        await DzManager.save( JSON.stringify( data ) );
      }
      app.HideProgress();
      app.ShowPopup( "ДЗ успешно добавлено!", "bottom" );
    } );
  } );
  DzBtn.SetStyle( "#4285F4", "#4285F4", 4 );
  DzBtn.SetPosition( 0.05, 0.9 );
  DzBtn.SetTextSize( 20, "pl" );
  MainLay.AddChild( DzBtn );
  setInterval( GetClosest, 1000 );
  LoadLay.Animate( "FadeOut" );
}

function OnBack() {
  if ( MainLst.GetItemByIndex( 0 ).title.split(" ")[0] != "Понедельник" ) {
    MainLst.SetList(dfltLst);
    GetClosest();
  } else {
    app.Exit();
  }
}

String.prototype.isNumber = function(){return /^\d+$/.test(this)}

function ShowTextDialog( title, deflt, callback, texts = ["Ок", "Отмена"]) {
  app.ShowProgress( "Загрузка окна..." );
  BtnWidth = 0.45;
  TxtWidth = 0.9;
  
  TxtDlg = app.CreateDialog( title );
  TxtDlgLay1 = app.CreateLayout( "Linear", "Vertical" );
  closest = GetClosest();
  shed = Object.values(shedule)[day][parseInt(Object.keys(rings).indexOf(closest)/2)];
  if ( shed == undefined ) shed = "Классный час";
  TxtDlgBtn0 = app.CreateButton( shed, TxtWidth );
  TxtDlgBtn0.SetOnTouch( function() {
    ShowAssetsDialog( function (txt) {
      TxtDlgBtn0.SetText( txt );
      d=f(txt);
      TxtDlgEdt1.SetHint( "Задано до "+d+" числа? *введи число" );
    }, "Выберите предмет", Object.keys(data).join(",") );
  } );
  TxtDlgLay1.AddChild( TxtDlgBtn0 );
  function f(s) {
    d = date.getDate()+1;
    arr = [...range(day+1, 6), ...range(0, 6)]
    for ( i in arr ) {
      if ( Object.values(shedule)[arr[i]].includes(s) ) {
        break
      } else {
        d += 1;
      }
    }
    return d;
  }
  d=f(shed);
  TxtDlgEdt1 = app.CreateTextEdit( "", TxtWidth, null, "Left,SingleLine" );
  TxtDlgEdt1.SetHint( "Задано до "+d+" числа? *введи число" );
  TxtDlgLay1.AddChild( TxtDlgEdt1 );
  
  TxtDlgEdt2 = app.CreateTextEdit( deflt, TxtWidth, null, "Left,Multiline" );
  TxtDlgEdt2.SetHint( "Запиши ДЗ" );
  TxtDlgLay1.AddChild( TxtDlgEdt2 );
  
  TxtDlgLay2 = app.CreateLayout( "Linear", "Horizontal,Center" );
  TxtDlgLay2.SetMargins( 0, 0.02, 0, 0.01 ); 
  
  TxtDlgBtn1 = app.CreateButton( texts[0], BtnWidth );
  TxtDlgBtn1.SetOnTouch( function() {
    next = false
    if ( TxtDlgEdt1.GetText().startsWith("!") ) {
      next = true;
      TxtDlgEdt1.SetText( TxtDlgEdt1.GetText().substring(1) );
    }
    if ( TxtDlgEdt1.GetText() == "" || !TxtDlgEdt1.GetText().isNumber() ) {
      next = false;
      TxtDlgEdt1.SetText( d );
    }
    d = parseInt(TxtDlgEdt1.GetText());
    mon = date.getMonth() + (next?1:0);
    callback( TxtDlgBtn0.GetText(), mon, d, TxtDlgEdt2.GetText() );
    TxtDlg.Dismiss();
  } );
  TxtDlgLay2.AddChild( TxtDlgBtn1 );
  
  TxtDlgBtn2 = app.CreateButton( texts[1], BtnWidth );
  TxtDlgBtn2.SetOnTouch( function() { TxtDlg.Dismiss() } );
  TxtDlgLay2.AddChild( TxtDlgBtn2 );
  
  TxtDlgLay1.AddChild( TxtDlgLay2 );
  TxtDlg.AddLayout( TxtDlgLay1 );
  TxtDlg.Show();
  app.HideProgress();
}


function ShowAssetsDialog(callback, title, lst, callback2=false, hide=true) {
  app.ShowProgress( "Загрузка списка..." );
  dlgAssets = app.CreateDialog( title );
  dlgAssets.SetBackColor( "#2E3134" );
  
  layAssets = app.CreateLayout( "linear", "Vertical,Center,FillXY" );
  layAssets.SetPadding( 0.03, 0.015, 0.03, 0.015 );
  
  lstAssets = app.CreateList( lst, 0.9, 0.4, "Bold,AlumButton" );
  lstAssets.SetPadding( 4,0,0,0, "dip" );
  lstAssets.SetTextSize1( "18", "dip" );
  lstAssets.SetOnTouch( function (title, body, image, index) {
    callback(title, index);
    if ( hide ) dlgAssets.Dismiss();
  } );
  lstAssets.SetOnLongTouch( function (title, body, image, index) {
    if ( callback2 ) {
      callback2(title, index);
      if ( hide ) dlgAssets.Dismiss();
    }
  } );
  layAssets.AddChild( lstAssets );
  
  dlgAssets.AddLayout( layAssets );
  dlgAssets.Show();
  app.HideProgress();
}
