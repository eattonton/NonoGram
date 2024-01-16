import jsonData from "./res/data2.json"
import pngQr from "./res/qr.png"
import { TW_AddLoadEvent } from "./js/twloader"
import { RandomInt, GetRandQueueInRange, GetRandQueue } from "./js/math"
import { Toast, Dialog } from "./js/ttui"
import { CTableData, CTableCellData, CDrawTable } from "./js/table"

const TT = {};
window.game = TT;

TW_AddLoadEvent(Start);

//游戏规则

//////////////////////
//程序入口
////////////////////
function Start() {
    TT.canvas = document.getElementById("board");
    TT.ctx = TT.canvas.getContext("2d");
    TT.width = TT.canvas.width;
    TT.height = TT.canvas.height;

    //添加事件
    SetupBtnClick('btn1', () => { CreateA4(1); });
    SetupBtnClick('btn2', () => { CreateA4(2); });
    SetupBtnClick('btn3', () => { CreateA4(3); });
}

function SetupBtnClick(btnName, cb) {
    document.getElementById(btnName).addEventListener('click', cb);;
}

//成行显示
function WriteTextsH(arr1, x, y, hei, scale) {
    let tbWid = 0;
    let x2 = x;
    let arr2 = [];
    for (let i = 0; i < arr1.length; ++i) {
        x2 = x2 + tbWid;
        let oTxt = WriteText(arr1[i], x2, y, hei, scale);
        //计算宽度
        tbWid = arr1[i].length * hei * 0.8;
        arr2.push(oTxt);
    }

    return arr2;
}

//绘制题目
function WriteText(str1, x, y, hei, scale) {
    scale = scale || 60;
    let fontHei = hei * scale + "px";
    TT.ctx.font = "normal " + fontHei + " Arial";
    TT.ctx.fillStyle = "#000000";
    TT.ctx.fillText(str1, x * scale, y * scale);

    return { txt: str1, x: x, y: y, h: hei, s: scale };
}

var m_hard = 1;
var m_mode = 1;
var m_move = 1;   //移动次数

/** @type {CDrawTable} */
var m_drawTB = null;  //绘制对象

//生成题目
function CreateA4(hard, mode, move) {
    m_hard = hard;
    m_mode = mode || 1;
    m_move = move || 1;
    var toastDlg = new Toast({
        text: "生成中"
    });
    toastDlg.Show();
    TT.ctx.fillStyle = "white";
    TT.ctx.fillRect(0, 0, TT.width, TT.height);
    //1.title
    WriteText("数 织", 8.5, 1.5, 1.0);
    //2.sub-title
    WriteTextsH(["班级________", "姓名________", "用时________", "得分________"], 2.5, 3.5, 0.5);

    //绘制对象
    m_drawTB = new CDrawTable(TT.ctx);
    //生成题目
    if (m_hard == 1) {
        for (let i = 0; i < 6; i++) {
            if (!DrawBoxN(i, 6, 4.5, 8.5, 9.5, 8)) {
                --i;
            }
        }
    } else if (m_hard == 2) {
        for (let i = 0; i < 6; i++) {
            if (!DrawBoxN(i, 8, 4.5, 8.5, 9.5, 8.2)) {
                --i;
            }
        }
    } else if (m_hard == 3) {
        for (let i = 0; i < 4; i++) {
            if (!DrawBoxN(i, 12, 3.5, 8.5, 9.5, 12)) {
                --i;
            }
        }
    }


    //显示
    //二维码
    DrawImage(pngQr, () => {
        toastDlg.Close();
        ShowImageDlg();
    });
}

function DrawBoxN(idx, size, startX, startY, stepX, stepY) {
    if (idx % 2 == 1) {
        startX += stepX;
    }

    startY += parseInt(idx / 2) * stepY;

    //创建一个表格对象
    let objTB = new CTableData(size, size / 2, size / 2);

    //获得一个数织的 数据
    let data = { s: size };
    data["t"] = "随机";
    data["d"] = GetRandomGameData(data["s"]);
    if (data["s"] == 12 && RandomInt(0, 50) == 0) {
        //读取图
        let idxData = RandomInt(0, jsonData.length - 1);
        data = jsonData[idxData];
    }
    //绘制标题
    WriteText("题目" + (idx + 1) + ":" + data["t"], startX - 2, startY - 3.3, 0.5);
    //填充表格
    for (let i = 0; i < data["s"] * data["s"]; i++) {
        if (data["d"][i] == 0) {
            objTB.SetCellColor(i, "black");
        }
    }
    //统计表格中的数织数值
    let arr1 = SummaryTBByRow(objTB);
    let arr2 = SummaryTBByCol(objTB);
    //绘制
    DrawRowValues(startX, startY, objTB.csize, arr2);
    DrawColValues(startX, startY, objTB.csize, arr1);
    //绘制边线
    DrawLimitEdges(objTB, startX, startY);
    //绘制表格
    m_drawTB.DrawTable(objTB, startX, startY);
    return true;
}

function GetRandomGameData(size) {
    //生成随机游戏数据
    //return GetRandQueueInRange(size*size,0,1);
    let arr1 = Array(size * size).fill(1);
    for (let i = 0; i < size; i++) {
        let arr2 = GetRandQueueInRange(RandomInt(1, size / 2), 1, size);
        arr2.forEach((item) => {
            arr1[i * size + item] = 0;
        })
    }

    return arr1;
}

/**
 * 按行统计数值
 * @param {CTableData} objTB 
 */
function SummaryTBByRow(objTB) {
    let arr1 = [];
    for (let i = 0; i < objTB.size; i++) {
        let cells = objTB.GetCellsByRow(i);
        let arr2 = SummaryTBByCells(cells);
        arr1.push(arr2);
    }
    return arr1;
}

/**
 * 按列统计数值
 * @param {CTableData} objTB 
 */
function SummaryTBByCol(objTB) {
    let arr1 = [];
    for (let i = 0; i < objTB.size; i++) {
        let cells = objTB.GetCellsByCol(i);
        let arr2 = SummaryTBByCells(cells);
        arr1.push(arr2);
    }
    return arr1;
}

/**
 * 按单元格FillColor统计
 * @param {CTableCellData[]} cells 
 */
function SummaryTBByCells(cells) {
    let arr1 = [];
    let num1 = 0;
    let sta1 = false;
    cells.forEach((c) => {
        if (c.fillColor != "") {
            num1++;
            sta1 = true;
        } else {
            if (sta1) {
                arr1.push(num1);
                num1 = 0;
                sta1 = false;
            }
        }
    })

    if (sta1) {
        //最后一个
        arr1.push(num1);
    }

    if (arr1.length == 0) {
        arr1.push(0);
    }

    return arr1;
}

/**
 * 输出行的值
 * @param {*} x0 
 * @param {*} y0 
 * @param {*} step
 * @param {*} arrVals 
 */
function DrawRowValues(x0, y0, step, arrVals) {
    let staX = x0 - step - 0.1;
    let staY = y0 + step;

    let posX = staX;
    let posY = staY;
    for (let i = 0; i < arrVals.length; i++) {
        let arr2 = arrVals[i];
        posX = staX - step * arr2.length;
        posY = staY + step * i;
        for (let j = 0; j < arr2.length; j++) {
            posX += step;
            WriteText(arr2[j] + "", posX, posY - 0.1, 0.4);
        }
    }

}

/**
 * 输出列的值
 * @param {*} x0 
 * @param {*} y0 
 * @param {*} step
 * @param {*} arrVals 
 */
function DrawColValues(x0, y0, step, arrVals) {
    let staX = x0;
    let staY = y0 - 0.2;

    let posX = staX;
    let posY = staY;
    for (let i = 0; i < arrVals.length; i++) {
        let arr2 = arrVals[i];
        posX = staX + step * i;
        posY = staY - step * arr2.length;
        for (let j = 0; j < arr2.length; j++) {
            posY += step;
            WriteText(arr2[j] + "", posX + 0.1, posY, 0.4);
        }
    }
}

/**
 * 绘制当前表格边界线段
 * @param {CTableData} objTB 
 */
function DrawLimitEdges(objTB, x0, y0) {
    let posx = x0;
    let posy = y0;
    let len = 2;
    //绘制上方竖线
    for (let i = 0; i <= objTB.size; i++) {
        posx = x0 + objTB.csize * i;
        m_drawTB.DrawLine(posx, posy, posx, posy - len, 0.01);
    }

    posx = x0;
    posy = y0;
    //绘制左侧水平线
    for (let i = 0; i <= objTB.size; i++) {
        posy = y0 + objTB.csize * i;
        m_drawTB.DrawLine(posx, posy, posx - len, posy, 0.01);
    }
}

//绘制图片
function DrawImage(img0, cb) {
    let imgObj = new Image();
    imgObj.src = img0;
    imgObj.onload = function () {
        TT.ctx.drawImage(imgObj, 10, 10, 150, 150);
        if (typeof cb == "function") {
            cb();
        }
    }
}

//显示生成的题目图片，长按保存
function ShowImageDlg() {
    let strImg = "<img ";
    strImg += "src=" + TT.canvas.toDataURL('png', 1.0);
    strImg += " style='width:350px;height:500px;'></img>";
    let dlg1 = new Dialog({
        title: "长按图片，保存下载",
        text: strImg
    });

    dlg1.Show();
}



