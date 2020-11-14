var app = angular.module("myApp", []);
app.controller("myController", function ($scope, $http) {



    $scope.crushers = ['CRUSHER-1', 'CRUSHER-2', 'CRUSHER-3'];
    $scope.shovels = ['P&H-06', 'P&H-07', 'P&H-10',
        'P&H-11', 'P&H-12', 'P&H-13', 'P&H-14', 'P&H-15',
        'P&H-16', 'P&H-17', 'P&H-18', 'P&H-19', 'HIM-20', 'PC-TATA', 'KOMATSU-PC', 'LAXMAN-PC', 'PL-06', 'PL-07', 'SM-L&T'];
    $scope.draglines = ['JYOTI', 'PAWAN', 'VNDHYA', 'JWALA'];
    $scope.siloNames = ['OLD SILO', 'NEW SILO', 'WHARF WALL'];

    $scope.statusCodes = [0, 1, 2, 3];
    $scope.statusStrings = ['IDL', 'RNG', 'BDN', 'MNT', 'UDF'];


    $scope.machines = [];
    $scope.silos = [];
    $scope.dumper = {};
    $scope.dumpers = [];  // stores hourly snapshots of dumper objects.
    $scope.dumperTotal = {};


    $scope.time = new Date().getTime();
    $scope.stamp = ""  // time of fetched status
    $scope.syncCounter = 0;

    $scope.pin = "";

    $scope.user = "Guest";
    $scope.status = "Please user PIN:1234 to login as Viewpoint";
    $scope.upUrl = 'https://sushanttiwari.in/serv/upLive.php';
    $scope.downUrl = 'https://sushanttiwari.in/serv/downLive.php';
    $scope.upUrl = 'serv/upLive.php';
    $scope.downUrl = 'serv/downLive.php';
    $scope.upUrl = 'http://localhost:8080/dch/serv/upLive.php';
    $scope.downUrl = 'http://localhost:8080/dch/serv/downLive.php';
    $scope.upUrl = 'http://localhost/dch/serv/upLive.php';
    $scope.downUrl = 'http://localhost/dch/serv/downLive.php';


    // GLOBALS /////
    let block = 0;
    let hour = 0;

    const blockWidth = 10;
    const totalBlocks = 8 * 60 / blockWidth;



    // CONFIGS ////////
    $scope.changed = false;
    $scope.auth = true;
    $scope.forceUpload = false;
    ///////////////////

    class Machine {
        constructor(name, type) {
            this.name = name;
            this.type = type;
            this.status = 0;
            this.remark = "";
            this.logs = [];
        }

        get = function () {
            return {
                name: this.name,
                type: this.type,
                status: this.status,
                remark: this.remark,
                logs: this.logs
            }
        }

        set = function (obj) {
            this.name = obj.name;
            this.type = obj.type;
            this.status = obj.status;
            this.remark = obj.remark;
            this.logs = obj.logs;
        }

        calculate = function () {
            this.idl = this.logs.filter(x => x == 0).length;
            this.run = this.logs.filter(x => x == 1).length;
            this.brk = this.logs.filter(x => x == 2).length;
            this.mnt = this.logs.filter(x => x == 3).length;


            this.avl = this.idl + this.run;
            this.navl = this.brk + this.mnt;
            this.total = this.avl + this.navl;

            this.pavl = Math.round(this.avl * 100 / this.total);
            this.putl = Math.round(this.run * 100 / this.total);
        }


    }

    class Silo {
        constructor(name) {
            this.name = name;
            this.rakes = 0;
            this.remark = "";
        }

        set = function (obj) {
            this.name = obj.name;
            this.rakes = obj.rakes;
            this.remark = obj.remark;
        }

        get = function () {
            return {
                name: this.name,
                rakes: this.rakes,
                remark: this.remark
            }
        }
    }

    class Dumper {
        constructor(hour) {
            this.hour = hour;

            this.east_total = 41;
            this.east_avl = 0;
            this.east_run = 0;

            this.west_total = 44;
            this.west_avl = 0;
            this.west_run = 0;
        }
        set = function (arr) {
            this.hour = arr[0];
            this.east_total = arr[1];
            this.east_avl = arr[2];
            this.east_run = arr[3];
            this.west_total = arr[4];
            this.west_avl = arr[5];
            this.west_run = arr[6];
        }
        get = function () {
            let k = [];
            k.push(this.hour);
            k.push(this.east_total);
            k.push(this.east_avl);
            k.push(this.east_run);
            k.push(this.west_total);
            k.push(this.west_avl);
            k.push(this.west_run);
            return k;
        }

        calculate = function () {
            this.east_pavl = Math.round(this.east_avl * 100 / (this.east_total));
            this.east_utl = Math.round(this.east_run * 100 / (this.east_total));
            this.west_pavl = Math.round(this.west_avl * 100 / (this.west_total))
            this.west_utl = Math.round(this.west_run * 100 / (this.west_total));
        }
    }


    initialize();


    function initialize() {


        timeBlock();

        angular.forEach($scope.crushers, function (x, i) {
            var k = new Machine(x, 'crusher');
            $scope.machines.push(k);
        })
        angular.forEach($scope.shovels, function (x, i) {
            var k = new Machine(x, 'shovel');
            $scope.machines.push(k);
        })
        angular.forEach($scope.draglines, function (x, i) {
            var k = new Machine(x, 'dragline');
            $scope.machines.push(k);
        })
        angular.forEach($scope.siloNames, function (x, i) {
            var k = new Silo(x)
            $scope.silos.push(k);
        })

        $scope.dumper = new Dumper();

        angular.forEach($scope.machines, function (mach,i) {
            for (j = 0; j < totalBlocks; j++){
                mach.logs[j] = 4;
            }
        })


        for (i = 0; i < hour; i++) {
            k = new Dumper(i);
            $scope.dumpers.push(k);
        }



        if ($scope.forceUpload) {
            upload();
            setTimeout(download, 5000);
        }

        else {
            download();
        }

        setInterval(sync, 5000);
    }

    function timeBlock() {
        var a = new Date(2019, 9, 5, 5, 0, 0, 0);
        var b = a.getTime();
        var c = new Date().getTime();
        var d = Math.floor((c - b) / (8 * 3600 * 1000));
        var e = b + d * (8 * 3600 * 1000);
        $scope.start = e;
        block = Math.floor((c - e) / (blockWidth * 60 * 1000));
        hour = Math.floor((c - e) / (60 * 60 * 1000));
        console.log('block:', block, '  hour:', hour);
    }



    function sync() {
        $scope.syncCounter++;

        if ($scope.changed && $scope.auth) {
            upload();
        }
        else if ($scope.syncCounter % 4 == 0) {
            timeBlock();
            download();
        }

    }



    $scope.update = function () {
        $scope.changed = true;
        performanceLog();
    }


    function download() {

        var payload = {};
        var req = {
            method: 'POST',
            url: $scope.downUrl,
            headers: {
                'Content-Type': undefined
            },
            data: payload
        };

        $http(req).then(
            function (res) {
                var a = res.data;
                var b = a.indexOf('{');
                var c = a.lastIndexOf('}');
                var d = a.slice(b, c + 1);
                var e = JSON.parse(d);

                $scope.stamp = e.stamp;
                t = e.time;

                angular.forEach($scope.machines, function (x, i) {
                    x.set(e.machines[i]);
                    x.calculate();
                })
                angular.forEach($scope.dumers, function (x, i) {
                    x.set(e.dumpers[i]);
                    x.calculate();
                })
                angular.forEach($scope.silos, function (x, i) {
                    x.set(e.silos[i]);
                })


                console.log('Downloaded..', e.stamp, 'By:' + e.user + ' @ ' + t);
                // console.log(e);

                if ($scope.stamp < $scope.start) {
                    console.log('Obsolete data detected. Resetting....');
                    reset();
                }
                // performanceLog();
            },
            function () {
                console.log("fetch failed");
            })
    }




    function upload() {

        let obj = {
            user: $scope.user,
            stamp: new Date().getTime(),
            time: new Date().toLocaleString(),
            machines: [],
            silos: [],
            dumpers: [],
            dumper: $scope.dumper,
        };


        angular.forEach($scope.machines, function (x, i) {
            obj.machines.push($scope.machines[i].get());
        })
        angular.forEach($scope.silos, function (x, i) {
            obj.silos.push($scope.silos[i].get());
        })
    
        angular.forEach($scope.dumpers, function (x, i) {
            obj.dumpers.push($scope.dumpers[i].get());
        })
  
        let objString = JSON.stringify(obj);
        let payload = { 'str': objString };
  

        var req = {
            method: 'POST',
            url: $scope.upUrl,
            headers: {
                'Content-Type': undefined
            },
            data: payload
        };

        $http(req).then(
            function (res) {
                var a = res.data;
                var b = a.indexOf('{');
                var c = a.lastIndexOf('}');
                var d = a.slice(b, c + 1);
                var e = JSON.parse(d);
                if (e.stamp == obj.stamp) {
                    console.log('Uploaded...', e.stamp);
                    $scope.changed = false; // only when upload is successful.
                }
            },
            function () {
                console.log("upload failed....");
            })
    }






    function reset() {

        angular.forEach($scope.machines, function (mach, i) {
            if (mach.status < 2) {
                mach.status = 0;
                mach.remark = "";
            }
            mach.logs[0] = mach.status;
            for (j = 1; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }
        });

        $scope.dumper = new Dumper();
        $scope.dumpers = [];

    }



    function performanceLog() {
        // console.log('logging................');

        timeBlock();

        // INTERPOLATION ////////////////////////

        angular.forEach($scope.machines, function (mach, i) {
            let valids = [0, 1, 2, 3];
            if (!valids.includes(mach.logs[0])) {
                mach.logs[0] = mach.status;
            }

            for (j = 1; j < block; j++) {
                if (!valids.includes(mach.logs[j])) {
                    mach.logs[j] = mach.logs[j - 1];
                }
            }

            mach.logs[block] = mach.status;

            for (j = block + 1; j < totalBlocks; j++) {
                mach.logs[j] = 4;
            }
        });
    }




    $scope.login = function () {
        if ($scope.pin == "8520") {
            $scope.user = "Viewpoint";
            $scope.auth = true;
        }
        else if ($scope.pin == "4563") {
            $scope.user = "Admin";
            $scope.auth = true;
        }
        else {
            $scope.pin = ""
        }
    }


    $scope.machineStatus = function (mach) {

        if (mach.status == 3) {
            // mach.status = 2;
            mach.remark = "MAINTENANCE";
        }
        else {
            mach.remark = "";
        }
        $scope.update();

    }

    $scope.machStatus = function (mach, i) {
        console.log(i);
        mach.status = i;
    }



    $scope.dumperCounter = function (command) {
        if (command == 1) {
            if ($scope.dumper.east_avl > 0)
                $scope.dumper.east_avl--;
        }
        else if (command == 2) {
            if ($scope.dumper.east_avl < $scope.dumper.east_total)
                $scope.dumper.east_avl++;
        }
        else if (command == 3) {
            if ($scope.dumper.east_run > 0)
                $scope.dumper.east_run--;
        }
        else if (command == 4) {
            if ($scope.dumper.east_run < $scope.dumper.east_avl)
                $scope.dumper.east_run++;
        }

        else if (command == 5) {
            if ($scope.dumper.west_avl > 0)
                $scope.dumper.west_avl--;
        }
        else if (command == 6) {
            if ($scope.dumper.west_avl < $scope.dumper.west_total)
                $scope.dumper.west_avl++;
        }
        else if (command == 7) {
            if ($scope.dumper.west_run > 0)
                $scope.dumper.west_run--;
        }
        else if (command == 8) {
            if ($scope.dumper.west_run < $scope.dumper.west_avl)
                $scope.dumper.west_run++;
        }

        $scope.update();
    }



    $scope.trendToggle = function (mach, i) {
        if ($scope.auth) {
            k = mach.logs[i];
            k += 1;
            k %= 4;
            mach.logs[i] = k;
            $scope.changed = true;
        }
        $scope.update();
    }






    $scope.timef = function (block) {
        k = $scope.start + block * blockWidth * 60 * 1000;
        l = new Date(k);
        h = l.getHours();
        h = h % 12;
        if (h == 0) { h = 12; }
        t = "" + h + ":" + (l.getMinutes() < 10 ? "0" : "") + l.getMinutes() + (l.getHours() < 12 ? " AM" : " PM");
        return t;
    }



    function tohhmm(mins) {
        h = Math.floor(mins / 60);
        m = mins % 60;
        return h.toString() + " : " + (m < 10 ? "0" : "") + m.toString();
    }


});  