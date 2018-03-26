function pieChartVis(){
    var width = 200;
    var height = 200;
    var colores_movielens = ["#e6194b", "#3cb44b", "#ffe119", "#0082c8", "#f58231", "#911eb4", "#46f0f0", "#f032e6", "#d2f53c", "#fabebe", "#008080", "#e6beff", "#aa6e28", "#800000", "#aaffc3", "#808000", "#ffd8b1", "#000080", "#b15928", "#6a3d9a", "#33a02c"]
    var data = []
    var pie=null;
    var path=null;
    var label=null;

    var divChart = "";

    this.init = function(divmio){
        divChart = divmio;
        var svg = d3.select(divmio).append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("left", "26%")
            .style("position", "relative")
        //width = +svg.attr("width"),
        //height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + height / 2 + ")");
    
        pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.val; });

        path = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

        label = d3.svg.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);
    }


    this.clearAll = function(){
        remove();
    }

    function remove(){
        d3.select(divChart+" svg g").selectAll("*").remove()
    }

    this.update = function(dat){
        remove();
        
        data = transform_data(dat);
        var arc = d3.select(divChart+" svg g").selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
              .attr("class", "arc");

          arc.append("path")
              .attr("d", path)
              .attr("fill", function(d) { 
                return colores_movielens[d.data.x]; });

          arc.append("text")
              .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
              .attr("dy", "0.35em")
              .text(function(d) { 
                /*if(d.data.val < 0.03)
                    return "";
                return parseFloat(d.data.val).toFixed(2); */
                return "";
            });
    }

    function transform_data(data){
        var res = [];
        for(var i = 0; i < data[0].length; i++){
            res.push({"name": "", "val": data[0][i], "x": i})
        }
        return res;
    }

    
}