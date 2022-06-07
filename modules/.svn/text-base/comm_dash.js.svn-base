class comm_dash{
    constructor(totalCount,currentPage,perPage){
        this.perPage = perPage;
        this.totalCount =parseInt(totalCount);
        this.pageCount = Math.ceil(this.totalCount / this.perPage);
        this.currentPage = parseInt(currentPage);
        if(parseInt(currentPage)<1)this.currentPage=1;
        if(parseInt(currentPage)>this.pageCount)this.currentPage=this.pageCount;
        
        // this.start = this.pageCount == this.currentPage ? (this.totalCount-this.perPage) : ((this.currentPage-1) * this.perPage);
        this.start = (this.currentPage-1) * this.perPage;
        if(this.start < 0) this.start = 0;
        this.end = this.pageCount == this.currentPage ? this.totalCount : (this.currentPage * this.perPage);
        this.range = this.end - this.start;
        this.limit = this.start + "," + this.range;

        //30,5,7  (1-1)*7,1*7   (2-1)*7,2*7
    }
    
    getPages(diplayNum){
        this.previousPage = parseInt((this.currentPage-1-diplayNum)/diplayNum)*diplayNum+diplayNum;
        if(this.currentPage<=diplayNum)this.previousPage=1;

        this.nextPage = parseInt((this.currentPage-1+diplayNum)/diplayNum)*diplayNum+1;
        if(parseInt((this.currentPage - 1 + diplayNum)/diplayNum) == parseInt((this.pageCount - 1 + diplayNum)/diplayNum) && (this.pageCount-this.currentPage)<diplayNum)this.nextPage=this.pageCount;

        this.pages=[];
        //max = 14;
        //cpage = 3;
        //dpnum = 5;
        let moc = this.pageCount%diplayNum==0 ? parseInt(this.pageCount/diplayNum):parseInt(this.pageCount/diplayNum)+1;
        //namo = max%dpnum;
        let pageNum = 0;
        for(let i=0;i<moc;i++){
            let resRow = [];
            for(let y=0;y<diplayNum;y++){
                pageNum++;
                resRow.push(pageNum);
                if(pageNum>=this.pageCount)break;
            }
            this.pages.push(resRow);
        }
        this.page = Math.ceil(this.currentPage/diplayNum);
        // return this.pages;

        this.threePages = {
            previousPage: this.previousPage,
            currentPage: this.currentPage,
            nextPage: this.nextPage
        }
    }
}
module.exports = Pagination;