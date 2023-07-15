
export class Point {
    x: number;
    y: number;
    z: number | string;
    layerNum: number;

    constructor(x: number, y: number, z: number | string, layerNum: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.layerNum = layerNum;
    }
}

export class Rect {
    x: number;
    y: number;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point: Point) {
        return(
            point.x >= this.x - this.w &&
            point.x <= this.x + this.w && 
            point.y >= this.y - this.h && 
            point.y <= this.y + this.h
            );
    }

    intersects(range: Rect) {
        return !(
            range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h
            ); 
    }
}

export class QuadTree {
    boundry: Rect;
    capacity: number;
    points: Point[];
    divided: boolean;

    constructor(boundry: Rect, n: number) {
        this.boundry = boundry;
        this.capacity = n;
        this.points =[];
        this.divided = false;
    }

    subdivide = function(this: any) {
        let x = this.boundry.x;
        let y = this.boundry.y;
        let w = this.boundry.w;
        let h = this.boundry.h;

        let ne = new Rect(x + w/2, y - h/2, w/2, h/2);
        this.northeast = new QuadTree(ne, this.capacity);

        let nw = new Rect(x - w/2, y - h/2, w/2, h/2);
        this.northwest = new QuadTree(nw, this.capacity);

        let se = new Rect(x + w/2, y + h/2, w/2, h/2);
        this.southeast = new QuadTree(se, this.capacity);

        let sw = new Rect(x - w/2, y + h/2, w/2, h/2);
        this.southwest = new QuadTree(sw, this.capacity);

        this.divided = true;
    }

    insert(this: any, point: Point) {
        if (!this.boundry.contains(point)) return false;

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        } else {
            if (!this.divided) this.subdivide();

            if (this.northeast.insert(point)) return true;
            else if (this.northwest.insert(point)) return true;
            else if (this.southeast.insert(point)) return true;
            else if (this.southwest.insert(point)) return true;
        }
    }

    show(this: any, rc: any) {
        rc.rectangle(this.boundry.x, this.boundry.y, this.boundry.w*2, this.boundry.h*2, {
            fill: "rgba(0, 0, 0, 0)",
            stroke: "rgb(255, 255, 255)"
        });
        if (this.divided) {
            this.northeast.show(rc)
            this.northwest.show(rc)
            this.southeast.show(rc)
            this.southwest.show(rc)
        }
    }

    query(this: any, num: number, range: Rect, found: Point[] | null) {
        if (!found) found = [];
        if (!this.boundry.intersects(range)) {
            return;
        } else {
            for (let p of this.points) {
                if (range.contains(p) && p.layerNum === num) {
                    found.push(p);
                }
            }

            if (this.divided) {
                this.northwest.query(num, range, found);
                this.northeast.query(num, range, found);
                this.southwest.query(num, range, found);
                this.southeast.query(num, range, found);
            }
        }
        return found;
    }

    queryWithZ(this: any, range: Rect, found: Point[] | null) {
        if (!found) found = [];
        if (!this.boundry.intersects(range)) {
            return;
        } else {
            for (let p of this.points) {
                if (range.contains(p) && p.z !== "empty") {
                    found.push(p);
                }
            }

            if (this.divided) {
                this.northwest.queryWithZ(range, found);
                this.northeast.queryWithZ(range, found);
                this.southwest.queryWithZ(range, found);
                this.southeast.queryWithZ(range, found);
            }
        }
        return found;
    }

    queryWithoutZ(this: any, range: Rect, found: Point[] | null) {
        if (!found) found = [];
        if (!this.boundry.intersects(range)) {
            return;
        } else {
            for (let p of this.points) {
                if (range.contains(p) && p.z === "empty") {
                    found.push(p);
                }
            }

            if (this.divided) {
                this.northwest.queryWithoutZ(range, found);
                this.northeast.queryWithoutZ(range, found);
                this.southwest.queryWithoutZ(range, found);
                this.southeast.queryWithoutZ(range, found);
            }
        }
        return found;
    }
}
