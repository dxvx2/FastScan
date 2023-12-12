MediaPlayer.dependencies.bfAlgo = function() {
    "use strict";

    var getBitrate = function(B_h, bfVar, bfLevel, sc, st) {

        if(bfLevel <= 1.2){
            return 0;
        }
        
        var self = this,
            sumFetched = 0,
            delta = 0.000001, 
            maxShift = 2,
            s = bfVar.s,
            L = bfVar.L,
            C = bfVar.C,
            W = bfVar.W,
            Bm = bfVar.Bm,
            bfLayerQuality = [1400, 2400, 4000, 8000, 12000],
            d = bfVar.d,
            deadline = bfVar.deadline,
            X = [], 
            x = [], 
            ft = bfVar.ft, 
            I0 = bfVar.I0,
            bwLen = C + 500; 

        for (var i = 1; i <= C; i++) {
            X[i] = bfVar.X_0[i];
        }
        for (var i = 1; i <= C; i++) {
            for (var j = 1; j <= C + 60; j++) {
                x[i, j] = 0;
            }
        }

        if(B_h < 100){
            B_h = 100;
        }
        var tempValue = Math.ceil((Bm - bfLevel) / L);
        var tempValue2 = Math.floor(bfLevel / L);
        var ec = Math.min(sc + W, C); 
        deadline[sc] = st + tempValue2;
        for (var i = sc + 1; i <= C; i++){
            deadline[i] = deadline[i-1] + L;
            d[i] = d[sc];
        }

        var totBw = B_h / 2;
        for (var i = st + 1; i <= deadline[sc]; i++) {
            totBw += B_h;
        }

        if(totBw < bfLayerQuality[0]){
            return 1;
        } else if (sc > ec) {
            return 4;
        } else {
            var et = deadline[ec];

            for (var i = 1; i <= C; i++) {
                X[i] = bfVar.X_0[i];
            }

            for (var i = 1; i <= C; i++) {
                for (var j = 1; j <= C + 60; j++) {
                    x[i, j] = 0;
                }
            }

            for (i = sc; i <= C; i++) {
                ft[i] = st;
            }

            forwardAlgo(B_h, sc, ec, X, deadline, Bm, I0, bfLevel, st, et, C, ft, x);
            backwardAlgo(B_h, sc, ec, X, bfVar.X_1, deadline, Bm, bfLevel, ft, x, st, C);

            for (var i = 1; i <= C; i++) {
                for (var j = 1; j <= 1000; j++) {
                    x[i, j] = 0;
                }
            }

            forwardAlgo(B_h, sc, ec, X, deadline, Bm, I0, bfLevel, st, et, C, ft, x);
            
            backwardAlgo(B_h, sc, ec, X, bfVar.X_2, deadline, Bm, bfLevel, ft, x, st, C);
            
            for (var i = 1; i <= C; i++) {
                for (var j = 1; j <= 1000; j++) {
                    x[i, j] = 0;
                }
            }

            forwardAlgo(B_h, sc, ec, X, deadline, Bm, I0, bfLevel, st, et, C, ft, x);

            backwardAlgo(B_h, sc, ec, X, bfVar.X_3, deadline, Bm, bfLevel, ft, x, st, C);

            for (var i = 1; i <= C; i++) {
                for (var j = 1; j <= 1000; j++) {
                    x[i, j] = 0;
                }
            }


            forwardAlgo(B_h, sc, ec, X, deadline, Bm, I0, bfLevel, st, et, C, ft, x);

            backwardAlgo(B_h, sc, ec, X, bfVar.X_4, deadline, Bm, bfLevel, ft, x, st, C);

            for (var i = 1; i <= C; i++) {
                for (var j = 1; j <= 1000; j++) {
                    x[i, j] = 0;
                }
            }


        }

        if (Math.abs(X[sc] - bfLayerQuality[0]) < delta) {
            return 1;
        } else if (Math.abs(X[sc] - bfLayerQuality[1]) < delta) {
            //if(bfLevel > 8){
                return 1;
            //}else{
                //return 1;
            //}
        } else if (Math.abs(X[sc] - bfLayerQuality[2]) < delta) {
            //if(bfLevel < 8){
                return 2;
            //}else{
                //return 3;
            //}
        } else if (Math.abs(X[sc] - bfLayerQuality[3]) < delta) {
            //if(bfLevel >= 8){
                return 3;
           // }else{
               // return 3;
            //}
        } else if (Math.abs(X[sc] - bfLayerQuality[4]) < delta) {
            if(bfLevel >= 8){
                return 4;
            }else{
                return 3;
            }
        }

    };

    var BaseforwardAlgo = function(B_h, Xt, ec, d, deadline, Bm, bfLevel, sc, st, C, bwLen, x, ft) {
        // TODO
        
        var delta = 0.000001,
            rows = C,
            //maxShift=4,
            cols = C + 60,
            ffFlag = [],
            fetchFlag = [],
            B = [],
            bf = [],
            X = [],
            tmp,
            j = st,
            i = sc;

        for (i = sc; i <= ec; i++) {
            X[i] = Xt[i];
        }

        for (var k = sc; k <= C; k++) {
            fetchFlag[k] = 0;
            ffFlag[k] = 0;
        }

        for (i = st; i <= deadline[ec] + 360; i++) {
            B[i] = B_h;

        }
        B[st] = B[st] / 2; // - sumFetched;


        bf[st] = Math.floor(bfLevel / 4);
        bf[st + 1] = Math.floor(bfLevel / 4);
        for (i = st + 2; i <= C + 100; i = i + 4) {
            for (var k = 0; k <= 3; k++) {
                bf[i + k] = Math.max(Math.floor(bfLevel / 4) - 1, 0);
            }

        }
        j = st;
        i = sc;

        while (i <= ec && fetchFlag[ec] == 0) {


            if (bf[j] >= Bm) {
                j = j + 1;
                continue;
            }

            var fetched = Math.min(B[j], X[i]);
            //alert(fetched);
            if (ffFlag[i] == 0 && fetched > delta) {
                ft[i] = j;
                ffFlag[i] = 1;
            }


            x[i, j] = x[i, j] + fetched;
            B[j] = B[j] - fetched;
            X[i] = X[i] - fetched;
            if (X[i] < delta && fetchFlag[i] == 0 && j <= deadline[i]) {

                for (var k = ft[i]; k <= deadline[i]; k++) {
                    bf[k] = bf[k] + 1;
                }
                fetchFlag[i] = 1;
                i = i + 1;
            } else if (X[i] < delta && fetchFlag[i] == 0 && j > deadline[i]) {
                tmp = j - deadline[i];

                
                for (var k = i; k <= C; k++) {
                    d[k] = d[k] + tmp;
                    deadline[k] = deadline[k] + tmp;

                }
                
                for (var k = ft[i]; k <= deadline[i]; k++) {
                    bf[k] = bf[k] + 1;
                }

                fetchFlag[i] = 1;

                i = i + 1;

            }

            if (B[j] < delta) {
                j = j + 1;


            }


        }




    };


    var BaseBackAlgo = function(B_h, Xl, x, ec, d, deadline, Bm, bfLevel, ft, sc, st, C) {
        var delta = 0.000001,
            i = ec,
            j = deadline[ec],
            xSum,
            rem,
            BSum,
            fetched,
            B = [],
            bf = [],
            fetchFlag = [];

        for (var k = 1; k <= C; k++) {
            fetchFlag[k] = 0;
        }
        

        for (i = st; i <= j + 60; i++) {
            B[i] = B_h;

        }
        B[st] = B[st] / 2; // - sumFetched;

        bf[st] = Math.floor(bfLevel / 4);
        bf[st + 1] = Math.floor(bfLevel / 4);
        for (var i = st + 2; i <= C + 100; i = i + 4) {
            for (var k = 0; k <= 3; k++) {
                bf[i + k] = Math.max(Math.floor(bfLevel / 4) - 1, 0);
            }

        }

        i = ec;
        

        while (j >= st) {
            if (i < sc) {
                break;
            }


            if (j <= deadline[i]) {

                if (bf[deadline[i]] >= Bm && fetchFlag[i] == 0) {

                    
                    for (var k = sc; k <= i; k++) {
                        d[k] = d[k] - 1;
                        deadline[k] = deadline[k] - 1;

                    }
                    continue;
                }

                if (fetchFlag[i] == 0) {
                    if (ft[i] > 0) {

                        xSum = 0;
                        for (var k = sc; k < i; k++) {
                            xSum = xSum + x[k, ft[i]];
                        }
                        rem = Math.max(B[ft[i]] - xSum, 0);

                    } else {
                        rem = 0;
                    }

                    BSum = 0;
                    for (var k = ft[i] + 1; k <= j; k++) {
                        BSum = BSum + B[k];
                    }
                    if (BSum + rem >= Xl[i] - delta) {
                        fetchFlag[i] = 1;
                    }


                }

                fetched = Math.min(B[j], Xl[i]);

                

                B[j] = B[j] - fetched;
                Xl[i] = Xl[i] - fetched;


                if (Xl[i] < delta) {
                    
                    //bf(j:deadline(i))=bf(j:deadline(i))+1;
                    for (var k = j; k <= deadline[i]; k++) {
                        bf[k] = bf[k] + 1;
                    }

                    i = i - 1;
                }

                if (B[j] < delta) {
                    j = j - 1;
                }

            } else {

                j = j - 1;
            }


        }
    };

    function forwardAlgo(B_h, sc, ec, Xt, deadline, Bm, I, bfLevel, st, et, C, ft, x) {
        var delta = 0.000001,
            
        //predefined array sizes 
            B = Array(deadline[ec] + 61).fill(B_h),
            bf = Array(C + 101).fill(Math.floor(bfLevel / 4)),
            X = Array(C + 1).fill(0),
            ffFlag = Array(C + 1).fill(0);
        //bandwith initialization
        B[st] = B[st] / 2;
        //initializing the bf array for buffer calculations
        for (var h = st + 2; h <= C + 100; h += 4) {
            bf.fill(Math.max(Math.floor(bfLevel / 4) - 1, 0), h, h + 4);
        }
        
        for (var i = sc; i <= ec; i++) {
            X[i] = Xt[i];
        }
    
        var i = sc, j = st, fetched;
        //main loop to process algo
        while (j <= deadline[ec]) {
            if (i > ec) {
                break;
            }
    
            if (j <= deadline[i]) {
                if (bf[j] >= Bm) {
                    j++;
                    continue;
                }
                //fetch minimum of bandwith
                fetched = Math.min(B[j], X[i]);
                if (ffFlag[i] === 0 && fetched > delta) {
                    ft[i] = j;
                    ffFlag[i] = 1;
                }
                
                if (!x[i]) x[i] = [];
                x[i][j] = (x[i][j] || 0) + fetched;
                //update bandwith and bitrate
                B[j] -= fetched;
                X[i] -= fetched;
                
                //increment buffer
                if (X[i] < delta) {
                    for (var k = ft[i]; k <= deadline[i]; k++) {
                        bf[k]++;
                    }
                    i++;
                }
                //move to next time slot if bandwith is depleted
                if (B[j] < delta) {
                    j++;
                }
            } else {
                i++;
            }
        }
    }
    





    var backwardAlgo = function(B_h, sc, ec, X, Xll, deadline, Bm, bfLevel, ft, x, st, C) {
        //alert(ft[10]);
        //I=zeros(1,ec);
        var delta = 0.000001,
            //k=1;
            i = ec,
            fetched,
            rem,
            xSum,
            BSum,
            B = [],
            bf = [],
            Xl = [],
            j = deadline[ec],
            fetchFlag = [],
            ffFlag = [];

        for (var k = sc; k <= C; k++) {
            fetchFlag[k] = 0;
            ffFlag[k] = 0;
        }

        for (i = 1; i <= C; i++) {
            Xl[i] = Xll[i];
        }

        for (var i = st; i <= deadline[ec] + 60; i++) {
            B[i] = B_h;
            //alert(B_h);
            //alert(B[i]);
        }
        B[st] = B[st] / 2; // - sumFetched;
        //alert(st);
        //alert(B[st]);
        bf[st] = Math.floor(bfLevel / 4);
        bf[st + 1] = Math.floor(bfLevel / 4);
        for (var i = st + 2; i <= C + 100; i = i + 4) {
            for (var k = 0; k <= 3; k++) {
                bf[i + k] = Math.max(Math.floor(bfLevel / 4) - 1, 0);
            }

        }
        //$('#txt_log').append("inside back1:\n");
        
        i = ec;

        while (j >= st) {
            //alert("inside while");
            //alert(i);
            //alert(j);
            if (i < sc) {
                break;
            }

            if (j <= deadline[i]) {
                //alert("inside while2");
                if (bf[deadline[i]] >= Bm && fetchFlag[i] == 0) {
                    //rem(j)=B(j);
                    //alert("inside while3");
                    i = i - 1;
                    //j=j-1;
                    continue;
                }
                //alert("inside while4");
                if (fetchFlag[i] == 0) {
                    // alert("inside while5");   
                    if (ft[i] > 0) {
                        //alert(ft[i]);
                        //rem=max(B(ft(i))-sum(x(sc:i-1,ft(i))),0);
                        xSum = 0;
                        for (var k = sc; k < i; k++) {
                            xSum = xSum + x[k, ft[i]];
                        }
                        rem = Math.max(B[ft[i]] - xSum, 0);
                    } else {
                        rem = 0;
                    }

                    BSum = 0;
                    for (var k = ft[i] + 1; k <= j; k++) {
                        BSum = BSum + B[k];
                    }
                    //alert("finding...");
                    //alert(BSum+rem);
                    //alert(Xl[i]);
                    //$('#txt_log').append("inside back2:\n");
                    if (BSum + rem >= Xl[i] - delta) {
                        X[i] = Xl[i];
                        // alert(X[i]);
                        fetchFlag[i] = 1;
                        //alert("inside while6");
                        //I(i)=i;
                        //%k=k+1;
                        //bft[i] = j;
                        //% bf(j:deadline(i))=bf(j:deadline(i))+1;
                        ffFlag[i] = 1;
                    } else if ((BSum + rem >= X[i] - delta) && (X[i] > delta)) {
                        Xl[i] = X[i];
                        //alert("inside while7");
                        fetchFlag[i] = 1;
                        //%I(i)=i;
                        //bft(i)=j;
                        //% bf(j:deadline(i))=bf(j:deadline(i))+1;
                        ffFlag[i] = 1;
                    } else if (X[i] < delta) {
                        i = i - 1;
                        //alert("inside while8");
                        continue;
                    }
                }

                //alert("inside while9");
                //$('#txt_log').append("inside back3:\n");
                fetched = Math.min(B[j], Xl[i]);
                B[j] = B[j] - fetched;
                Xl[i] = Xl[i] - fetched;

                if (Xl[i] < delta) {
                    //alert("inside while10");
                    //%bf(j:bft(i)-1)=bf(j:bft(i)-1)+1;
                    //bf(j:deadline(i))=bf(j:deadline(i))+1;
                    for (var k = j; k <= deadline[i]; k++) {
                        bf[k] = bf[k] + 1;
                    }
                    i = i - 1;
                }
                //%continue;
                if (B[j] < delta) {
                    j = j - 1;
                    //alert("inside while11");
                }
                //%continue
                //$('#txt_log').append("i: " + i + "\n");
                //$('#txt_log').append("j: " + j + "\n");
                //$('#txt_log').append("fetched: " + fetched + "\n");
                //$('#txt_log').append("SC: " + sc + "\n");
            } else {
                //alert("inside while12");
                j = j - 1;
            }
        }
    };

    return {
        debug: undefined,
        abrRulesCollection: undefined,
        manifestExt: undefined,
        metricsModel: undefined,
        getBitrate: getBitrate
    };
};

MediaPlayer.dependencies.bfAlgo.prototype = {
    constructor: MediaPlayer.dependencies.bfAlgo
};
