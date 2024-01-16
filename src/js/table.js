class CTablePoint {
    x = 0;
    y = 0;
    constructor() { }
}
class CTableCellData {
    width = 0;
    height = 0;
    row = 0;
    col = 0;
    posx = 0;
    posy = 0;
    //填充的文字
    text = "";
    //填充的颜色
    fillColor = ""
    borderColor = "black"

    constructor(i, j, w, h) {
        this.row = i;
        this.col = j;
        this.width = w;
        this.height = h;

        this.posx = this.width * i;
        this.posy = this.height * j;
    }

    GetPoints(x0, y0) {
        x0 = x0 + this.posx;
        y0 = y0 + this.posy;
        let pts = [];
        pts.push({ x: x0, y: y0 });
        pts.push({ x: x0 + this.width, y: y0 });
        pts.push({ x: x0 + this.width, y: y0 + this.height });
        pts.push({ x: x0, y: y0 + this.height });
        pts.push({ x: x0, y: y0 });
        return pts;
    }

    GetRect(x0, y0) {
        return [x0 + this.posx, y0 + this.posy, this.width, this.height];
    }
}

/**
 * 表格数据结构
 */
class CTableData {
    /** @type {CTableCellData[]} */
    cells = [];
    size = 1;
    width = 1;
    height = 1;

    csize = 1;

    constructor(size, w, h) {
        this.size = size || 1;
        this.width = this.height = w;
        this.height = h || this.height;

        let cw = this.width / this.size;
        let ch = this.height / this.size;
        //单元格 大小
        this.csize = cw;

        //划分单元格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.cells.push(new CTableCellData(i, j, cw, ch));
            }
        }
    }

    GetCellNum() {
        return this.size * this.size;
    }

    GetCellByIndex(idx) {
        return this.cells[idx];
    }

    GetCellByRowCol(r, c) {
        let idx = r * this.size + c;
        return this.GetCellByIndex(idx);
    }

    GetCellPointsByIndex(idx, x0, y0) {
        return this.GetCellByIndex(idx).GetPoints(x0, y0);
    }

    GetCellPointsByRowCol(r, c, x0, y0) {
        return this.GetCellByIndex(r, c).GetPoints(x0, y0);
    }

    SetCellColor(idx, fillColor) {
        this.GetCellByIndex(idx).fillColor = fillColor;
    }

    /**
     * 按行读取单元格
     * @param {*} iRow 
     * @returns 
     */
    GetCellsByRow(iRow) {
        let arr1 = [];
        for (let i = 0; i < this.size; i++) {
            //按列读取
            let idx = this.size*iRow + i;
            arr1.push(this.GetCellByIndex(idx));
        }
        return arr1;
    }

    /**
     * 按列读取单元格
     * @param {*} iCol 
     * @returns 
     */
    GetCellsByCol(iCol){
        let arr1 = [];
        for(let i=0;i<this.size;i++){
            //按行读取
            let idx = this.size * i + iCol;
            arr1.push(this.GetCellByIndex(idx));
        }
        return arr1;
    }

}

/**
 * 绘制表格
 */
class CDrawTable {
    /** @type {CanvasRenderingContext2D} */
    context2D = null;
    boardWidth = 0;
    boardHeight = 0;

    constructor(ctx) {
        this.context2D = ctx;
        this.boardWidth = ctx.canvas.width;
        this.boardHeight = ctx.canvas.height;
    }
    ClearRect() {
        this.context2D.fillStyle = "white";
        this.context2D.fillRect(0, 0, this.boardWidth, this.boardHeight);
    }

    /**
     * 
     * @param {CTableData} tbObj 
     * @param {number} x0
     * @param {number} y0
     * @param {*} strColor 
     * @param {*} strStyle 
     */
    DrawTable(tbObj, x0, y0, strColor = 'black', strStyle = 'solid') {
        for (let i = 0; i < tbObj.GetCellNum(); i++) {
            let tbCell = tbObj.GetCellByIndex(i);
            // this.DrawTBCell(tbCell.GetPoints(x0, y0), strColor, strStyle);
            this.DrawRect(...tbCell.GetRect(x0, y0), 0.01, 0, null, tbCell.fillColor);
        }
    }
    /**
     * 
     * @param {CTablePoint[]} pts 
     * @param {*} strColor 
     * @param {*} strStyle 
     */
    DrawTBCell(pts, strColor = "black", strStyle = "solid") {
        let linW = 0.04;
        let linScale = 60;

        for (let i = 0; i < pts.length; i++) {
            if (i == 0) {
                this.DrawLine(pts[pts.length - 1].x, pts[pts.length - 1].y, pts[i].x, pts[i].y, linW, linScale, strColor, strStyle);
            } else {
                this.DrawLine(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, linW, linScale, strColor, strStyle);
            }
        }
    }
    //绘制方格
    DrawSquare(x0, y0, width, strColor = "black", strStyle = "solid") {
        let linW = 0.04;
        let linScale = 60;
        this.DrawLine(x0, y0, x0 + width, y0, linW, linScale, strColor, strStyle);
        this.DrawLine(x0 + width, y0, x0 + width, y0 + width, linW, linScale, strColor, strStyle);
        this.DrawLine(x0 + width, y0 + width, x0, y0 + width, linW, linScale, strColor, strStyle);
        this.DrawLine(x0, y0 + width, x0, y0, linW, linScale, strColor, strStyle);
    }
    //绘制文本
    WriteText(str1, x, y, hei, scale) {
        scale = scale || 60;
        hei = hei * scale;
        let fontHei = hei + "px";
        this.context2D.font = "normal " + fontHei + " Arial";
        this.context2D.fillStyle = "#000000";
        let lines = str1.split('\n');
        for (let j = 0; j < lines.length; j++) {
            this.context2D.fillText(lines[j], x * scale, y * scale + (j * hei));
        }
    }
    //绘制直线
    DrawLine(x1, y1, x2, y2, wid = 0.04, scale = 60, strColor = "black", strStyle = "solid") {
        this.context2D.lineWidth = wid * scale;
        this.context2D.strokeStyle = strColor || "black";
        //开始一个新的绘制路径
        this.context2D.beginPath();
        if (strStyle == "dash") {
            this.context2D.setLineDash([0.1 * scale, 0.3 * scale]); // 设置虚线样式
            this.context2D.lineDashOffset = 0; // 设置虚线起始偏移量
        }
        else {
            this.context2D.setLineDash([]); // 设置实线样式
        }
        this.context2D.moveTo(x1 * scale, y1 * scale);
        this.context2D.lineTo(x2 * scale, y2 * scale);
        this.context2D.lineCap = "square";
        this.context2D.stroke();
        //关闭当前的绘制路径
        this.context2D.closePath();
    }
    //绘制圆
    DrawCircle(cx, cy, radius, wid, scale, strColor, strFill) {
        scale = scale || 60;
        wid = wid || 0.1;
        this.context2D.beginPath();
        this.context2D.setLineDash([]); // 设置实线样式
        this.context2D.lineWidth = wid * scale;
        this.context2D.strokeStyle = strColor || "black";
        this.context2D.arc(cx * scale, cy * scale, radius * scale, 0, 2 * Math.PI, false);
        this.context2D.stroke();
        if (strFill) {
            this.context2D.fillStyle = strFill || '#9fd9ef';
            this.context2D.fill();
        }
        //关闭当前的绘制路径
        this.context2D.closePath();
    }

    //绘制矩形
    DrawRect(x, y, w, h, wid, scale, strColor, strFill) {
        scale = scale || 60;
        wid = wid || 0.1;
        if (strFill != "") {
            /*填充矩形方法：fillRect(x,y,w,h)*/
           // this.context2D.fillStyle = 'blue';
           // this.context2D.fillRect(x * scale, y * scale, w * scale, h * scale);
        }
        /*描边矩形方法：strokeRect(x,y,w,h)*/
        this.context2D.strokeStyle = strColor || "black";
        this.context2D.lineWidth = wid * scale;
        this.context2D.strokeRect(x * scale, y * scale, w * scale, h * scale);
    }
    //绘制图片
    DrawImage(img0, cb, params) {
        let imgObj = new Image();
        imgObj.src = img0;
        imgObj.onload = () => {
            this.context2D.drawImage(imgObj, params[0], params[1], params[2], params[3]);
            if (typeof cb == "function") {
                cb();
            }
        };
    }
}

export {
    CTableCellData,
    CTableData,
    CDrawTable
}