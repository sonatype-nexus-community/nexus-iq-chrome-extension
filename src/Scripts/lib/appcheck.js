/*
 * Copyright (c) 2011-present Sonatype, Inc. All rights reserved.
 * Includes the third-party code listed at http://links.sonatype.com/products/clm/attributions.
 * "Sonatype" is a trademark of Sonatype, Inc.
 */
/*global $, pv, window, document */
(function() {
  "use strict";

  var blue = "#006bbf",
    orange = "#f4861d",
    yellow = "#f5c648",
    red = "#bc012f",
    darkRed = "#bc012f",
    darkOrange = "#f4861d",
    darkYellow = "#f5c648",
    darkBlue = "#006bbf",
    darkGrey = "#575757",
    lightGrey = "#edf1f4",
    bgBlue = "#f7fbfe",
    bgBorder = "#eef2fb",
    textColor = "#575757",
    pillColor = "#cee8fb",
    gridLine = "#dee6f3",
    ComponentInformation,
    highlightPanel,
    verticalRule,
    showThreatCategories,
    componentInfoVizContent,
    componentInfoBars,
    componentInfoSelectedIndex,
    componentInfoXIndex = 0,
    componentInfoXIndexInitial = null,
    componentInfoConfig;

  function getAge(reportDate, endDate) {
    var val,
      unit,
      diff =
        (endDate ? endDate.getTime() : new Date().getTime()) -
        reportDate.getTime();
    if (diff > 12 * 30 * 24 * 60 * 60 * 1000) {
      val = diff / (12 * 30 * 24 * 60 * 60 * 1000);
      unit = "year";
    } else if (diff > 30 * 24 * 60 * 60 * 1000) {
      val = diff / (30 * 24 * 60 * 60 * 1000);
      unit = "month";
    } else if (diff > 24 * 60 * 60 * 1000) {
      val = diff / (24 * 60 * 60 * 1000);
      unit = "day";
    } else if (diff > 60 * 60 * 1000) {
      val = diff / (60 * 60 * 1000);
      unit = "hour";
    } else if (diff > 60 * 1000) {
      val = diff / (60 * 1000);
      unit = "minute";
    } else {
      return "some seconds";
    }
    val = Math.floor(val);
    if (val > 1) {
      unit += "s";
    }
    return val + " " + unit;
  }

  var _artifactsChartDefaults = {
    height: 50,
    width: 50,
    lineWidth: 1.5,
    innerRadius: 9,
    outerRadius: 21,
    outerRadiusStep: 0,
    showLabels: false,
    fillColors: ["#FDDD03", "#8DC63E"],
    strokeColors: ["#3A983F"],
    textColors: ["white"]
  };

  function artifactsChart(known, config) {
    config = $.extend({}, _artifactsChartDefaults, config);

    config.visTop = config.height / 2;
    config.visLeft = config.width / 2;
    config.h = config.height;
    config.w = config.width;

    donutChart([known, 1 - known], config);
  }

  var _licenseChartDefaults = {
    height: 193,
    width: 235,
    innerRadius: 30,
    outerRadius: 60,
    outerRadiusStep: 7,
    fontSize: 16,
    showLabels: true,
    lineWidth: 1
  };

  function licenseChart(data, config) {
    config = $.extend({}, _licenseChartDefaults, config);

    if (Math.max.apply(null, data) !== 0) {
      config.h = config.height;
      config.w = config.width;
      config.visTop = config.h / 2 + 5;
      config.visLeft = config.w / 2 - 3.5;
      config.fillColors =
        data.length === 3 ? [red, yellow, blue] : [red, orange, yellow, blue];
      config.strokeColors =
        data.length === 3
          ? [darkRed, darkYellow, darkBlue]
          : [darkRed, darkOrange, darkYellow, darkBlue];
      config.textColors =
        data.length === 3
          ? ["#9d0c11", "#83740d", "white"]
          : ["#9d0c11", darkOrange, "#83740d", "white"];
      donutChart(data, config);
    } else {
      var vis = new pv.Panel().width(config.width).height(config.height);

      if (config.element) {
        vis.canvas(config.element);
      }

      _createLabel(vis, "No Licenses Found", {
        height: config.height,
        width: config.width
      });
      vis.render();
    }
  }

  function donutChart(data, config) {
    var total = 0,
      dd = [],
      fillColors = [],
      strokeColors = [],
      textColors = [],
      maxData = -1,
      totalExtra = 0,
      vis,
      wedge,
      maxIndex,
      i,
      extra;

    for (i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        total += data[i];
        dd.push(data[i]);
        fillColors.push(config.fillColors[i % config.fillColors.length]);
        strokeColors.push(config.strokeColors[i % config.strokeColors.length]);
        textColors.push(config.textColors[i % config.textColors.length]);
      }
    }
    maxIndex = dd.length - 1;

    for (i = 0; i < dd.length; i++) {
      if (maxData < 0 || dd[i] >= dd[maxData]) {
        maxData = i;
      }
      extra = total * 0.01 - dd[i];
      if (extra > 0) {
        dd[i] = total * 0.01;
        totalExtra += extra;
      }
    }
    dd[maxData] -= totalExtra;

    vis = new pv.Panel().width(config.w).height(config.h);

    if (config.element) {
      vis.canvas(config.element);
    }

    wedge = vis
      .add(pv.Wedge)
      .data(dd)
      .left(config.visLeft)
      .top(config.visTop)
      .outerRadius(function() {
        return (
          config.outerRadius + (maxIndex - this.index) * config.outerRadiusStep
        );
      })
      .innerRadius(config.innerRadius)
      .angle(function(d) {
        return (d / total) * 2 * Math.PI;
      })
      .fillStyle(
        pv.colors(fillColors).by(function() {
          return this.index;
        })
      )
      .lineWidth(function(d) {
        return d > 0 ? config.lineWidth : 0;
      })
      .strokeStyle(
        pv.colors(strokeColors).by(function() {
          return this.index;
        })
      );

    if (config.showLabels) {
      wedge
        .add(pv.Label)
        .left(function() {
          if (this.index === 1 && wedge.angle() < 0.61) {
            return (
              config.visLeft +
              (this.innerRadius() - 5) * Math.cos(wedge.midAngle())
            );
          }
          return (
            config.visLeft +
            (this.outerRadius() + 3) * Math.cos(wedge.midAngle())
          );
        })
        .top(function() {
          if (this.index === 1 && wedge.angle() < 0.61) {
            return (
              config.visTop +
              (this.innerRadius() - 5) * Math.sin(wedge.midAngle())
            );
          }
          return (
            config.visTop +
            (this.outerRadius() + 3) * Math.sin(wedge.midAngle())
          );
        })
        .font("bold " + config.fontSize + "px arial")
        .text(function(d) {
          return d === 0 || this.index === dd.length - 1
            ? ""
            : Math.round((d / total) * 100) + "%";
        })
        .textStyle(
          pv.colors(textColors).by(function() {
            return this.index;
          })
        )
        .textAlign(function() {
          var angle =
            wedge.midAngle() < 0
              ? Math.PI * 2 + wedge.midAngle()
              : wedge.midAngle();
          if (this.index === 2 && angle > Math.PI * 1.5) {
            return "left";
          } else if (Math.abs((angle % Math.PI) - Math.PI / 2) < 0.31) {
            return "center";
          } else if (this.index === 1 && wedge.angle() < 0.61) {
            return angle > Math.PI / 2 && angle < 1.5 * Math.PI
              ? "left"
              : "right";
          }
          return angle > Math.PI / 2 && angle < 1.5 * Math.PI
            ? "right"
            : "left";
        })
        .textBaseline(function() {
          var angle =
            wedge.midAngle() < 0
              ? Math.PI * 2 + wedge.midAngle()
              : wedge.midAngle();
          if (
            Math.abs(((angle + Math.PI / 2) % Math.PI) - Math.PI / 2) < 0.31
          ) {
            return "middle";
          } else if (this.index === 1 && wedge.angle() < 0.61) {
            return angle > Math.PI ? "top" : "bottom";
          }
          return angle > Math.PI ? "bottom" : "top";
        });
    }
    vis.render();
  }

  function punchCard(data, config) {
    data = data || [];
    config = config || {};

    var excess = [],
      w = 87,
      h = 5 * 32,
      max = -1,
      i,
      j,
      root,
      vis;
    if (data.length > 5) {
      excess = data.splice(5, data.length - 5);
      for (i = 0; i < excess.length; i++) {
        for (j = 0; j < excess[i].length; j++) {
          data[4][j] += excess[i][j];
        }
      }
    }

    $.each(data, function(rowIndex, row) {
      $.each(row, function(itemIndex, item) {
        max = Math.max(max, item);
      });
    });
    root = new pv.Panel().width(w + 20).height(h + 20);

    if (config.element) {
      root.canvas(config.element);
    }

    root
      .add(pv.Label)
      .text("Dependency Depth")
      .right(0)
      .top(3)
      .font("9px arial")
      .textStyle(textColor)
      .textAlign("right")
      .textBaseline("top");

    for (i = 0; i < 5; i++) {
      root
        .add(pv.Label)
        .text(i >= 4 && excess.length > 0 ? "5+" : i + 1)
        .font("9px arial")
        .textStyle(textColor)
        .left(3)
        .top(36 + i * 32)
        .textBaseline("middle");
    }

    vis = root
      .add(pv.Panel)
      .bottom(0)
      .right(0)
      .width(w)
      .height(h)
      .strokeStyle(bgBorder)
      .fillStyle(bgBlue);

    for (i = 1; i < 5; i++) {
      vis
        .add(pv.Rule)
        .strokeStyle(bgBorder)
        .top(i * 32);
    }

    $.each(data, function(rowIndex, row) {
      $.each(row, function(itemIndex, item) {
        // This is required otherwise IE8 shows dots for 0s.
        if (item > 0) {
          vis
            .add(pv.Dot)
            .data([item])
            .left(function() {
              return 16 + itemIndex * 28;
            })
            .top(16 + rowIndex * 32)
            .size(function(d) {
              return (d / max) * 144.0;
            })
            .fillStyle(function() {
              return itemIndex === 0 ? red : itemIndex === 1 ? orange : yellow;
            })
            .strokeStyle(function() {
              return itemIndex === 0
                ? darkRed
                : itemIndex === 1
                ? darkOrange
                : darkYellow;
            });
        }
      });
    });

    if (data.length === 0) {
      _createLabel(vis, "No Components", { height: h, width: w });
    }

    root.render();
  }

  var _createLabelDefaults = {
    fontSize: 9,
    leftPadding: 0,
    rightPadding: 0
  };

  function _createLabel(vis, labelText, config) {
    config = $.extend({}, _createLabelDefaults, config);

    var labelHeight = config.fontSize * 2,
      barWidth = labelText.length * config.fontSize * 0.6,
      barTop = config.height / 2 - labelHeight / 2,
      barStart =
        config.leftPadding +
        (config.width - config.leftPadding - config.rightPadding - barWidth) /
          2;

    vis
      .add(pv.Bar)
      .top(barTop)
      .left(barStart)
      .lineWidth(0)
      .height(labelHeight)
      .width(barWidth)
      .strokeStyle(pillColor)
      .fillStyle(pillColor);
    vis
      .add(pv.Dot)
      .top(barTop + labelHeight / 2)
      .left(barStart)
      .radius(labelHeight / 2)
      .lineWidth(0)
      .strokeStyle(pillColor)
      .fillStyle(pillColor);
    vis
      .add(pv.Dot)
      .top(barTop + labelHeight / 2)
      .left(barStart + barWidth)
      .radius(labelHeight / 2)
      .lineWidth(0)
      .strokeStyle(pillColor)
      .fillStyle(pillColor);
    vis
      .add(pv.Label)
      .top(barTop + labelHeight / 2)
      .left(barStart + barWidth / 2)
      .width(barWidth)
      .font("normal " + (config.fontSize + 1) + "px arial")
      .textAlign("center")
      .textBaseline("middle")
      .text(labelText);
  }

  ComponentInformation = (function() {
    var defaults = {
        partialDisplay: false,
        selectable: false,
        barGap: 3,
        barWidth: 8,
        contentWidth: 375,
        labelTop: 14,
        labelWidth: 100,
        topPadding: 20,
        vizPadding: 6,
        versionClick: $.noop,
        versionDblClick: $.noop
      },
      derivedValues = {
        actualHeight: function(config) {
          return this.height(config) + 11 + this.bottomPadding(config);
        },
        noCategoriesActualHeight: function(config) {
          return (
            this.noCategoriesHeight(config) + 11 + this.bottomPadding(config)
          );
        },
        barHeight: function(config) {
          return (config.barWidth + config.barGap) * 3 - 1;
        },
        height: function(config) {
          return (
            config.topPadding +
            this.contentRows(config) * (config.barWidth + config.barGap) +
            1
          );
        },
        noCategoriesHeight: function(config) {
          return (
            config.topPadding +
            this.contentRowsNoCategories(config) *
              (config.barWidth + config.barGap) +
            1
          );
        },
        contentRows: function(config) {
          return config.partialDisplay ? 4 : 11;
        },
        contentRowsNoCategories: function(config) {
          return config.partialDisplay ? 4 : 6;
        },
        bottomPadding: function(config) {
          return config.partialDisplay ? 20 : 0;
        },
        versionCount: function(config) {
          return config.data.versions ? config.data.versions.length : 0;
        },
        contentActualWidth: function(config) {
          return (config.barWidth + config.barGap) * this.versionCount(config);
        },
        width: function(config) {
          var currentIndex = config.data.currentVersionIndex
            ? config.data.currentVersionIndex
            : 0;

          //the inner width is twice the size of the area needed for the chart,
          //simply so that the current version can always be directly in the middle
          return Math.max(
            config.contentWidth,
            ((config.barWidth + config.barGap) *
              (Math.max(
                currentIndex,
                config.data.versions.length - currentIndex
              ) +
                1) -
              config.barGap) *
              2
          );
        },
        panning: function(config) {
          return this.width(config) > config.contentWidth;
        },
        left: function(config) {
          var currentIndex = config.data.currentVersionIndex;

          if (currentIndex < 0) {
            return 0;
          }

          //calculate the point in the inner chart where we need to start drawing, is based off having the current version centered in the chart
          return (
            this.width(config) / 2 -
            (currentIndex * (config.barWidth + config.barGap) +
              config.barWidth / 2 +
              config.barWidth / 2)
          );
        },
        spacer: function(config) {
          return config.barGap + config.barWidth;
        },
        top: function(config) {
          return config.topPadding;
        },
        itemWidth: function(config) {
          return config.barGap + config.barWidth;
        }
      };

    function getThreatSeverity(threatLevel) {
      if (threatLevel >= 8) {
        return 0; // CRITICAL
      } else if (threatLevel >= 4) {
        return 1; // SEVERE
      } else if (threatLevel > 1) {
        return 2; // MODERATE
      } else if (threatLevel === 1) {
        return 3; // LOW
      }
      return 4;
    }

    /* Convert JSON data to be consumed by the graphic */
    function parseJsonData(json) {
      var data = {
        versions: [],
        versionPopularity: [],
        majorRevIndices: [],
        policyThreatLevels: {
          HIGHEST_THREAT: [],
          SECURITY: [],
          LICENSE: [],
          QUALITY: [],
          OTHER: []
        }
      };

      $.each(json.versions, function (index, item) {
        console.log("index, item", index,  item);
        data.versions.push(item.componentIdentifier.coordinates.version);
        data.versionPopularity.push(
          item.popularity || item.relativePopularity || 0
        );

        if (json.version === item.componentIdentifier.coordinates.version) {
          data.currentVersionIndex = index;
        }
        if (item.majorRevisionStep) {
          data.majorRevIndices.push(index);
        }
        const threats = item.policyMaxThreatLevelsByCategory;
        data.policyThreatLevels.SECURITY.push(
          getThreatSeverity(threats.SECURITY)
        );
        data.policyThreatLevels.LICENSE.push(
          getThreatSeverity(threats.LICENSE)
        );
        data.policyThreatLevels.QUALITY.push(
          getThreatSeverity(threats.QUALITY)
        );
        data.policyThreatLevels.OTHER.push(getThreatSeverity(threats.OTHER));
        data.policyThreatLevels.HIGHEST_THREAT.push(
          Math.min(
            data.policyThreatLevels.SECURITY[index],
            data.policyThreatLevels.LICENSE[index],
            data.policyThreatLevels.QUALITY[index],
            data.policyThreatLevels.OTHER[index]
          )
        );
      });
      return data;
    }

    function getLeftPositionFn(config) {
      //used to calculate the left position of the item
      return function(index) {
        return (config.barGap + config.barWidth) * index + config.barGap;
      };
    }

    function createPanControls(labelViz, contentViz, panWrapper, config) {
      var leftPan = false,
        rightPan = false,
        panTop = 50, // fix position pan triangles in between the 2 charts
        pan = function(val) {
          let m = contentViz.transform().translate(val, 0),
            temp = componentInfoXIndex + val,
            currentIndex = config.data.currentVersionIndex
              ? config.data.currentVersionIndex
              : 0,
            initial = false;

          if (!componentInfoXIndexInitial) {
            componentInfoXIndexInitial = temp;
            initial = true;
          }

          //X axis indexes are inverted, as you move right indexes decrease, therefore the index distances are
          //multiplied by -1 for the right side
          let distanceFromCenterToLeftEdge = config.contentWidth / 2,
            distanceFromCenterToRightEdge = distanceFromCenterToLeftEdge * -1,
            leftBufferBetweenEdgeAndLastItem = config.itemWidth * 2,
            rightBufferBetweenEdgeAndLastItem =
              leftBufferBetweenEdgeAndLastItem * -1,
            xShiftFromCurrentVersionToLeftMostItem =
              currentIndex * config.itemWidth,
            xShiftFromCurrentVersionToRightMostItem =
              (config.data.versions.length - currentIndex) *
              config.itemWidth *
              -1,
            xShiftFromZeroToLeftMost =
              xShiftFromCurrentVersionToLeftMostItem +
              componentInfoXIndexInitial,
            xShiftFromZeroToRightMost =
              xShiftFromCurrentVersionToRightMostItem +
              componentInfoXIndexInitial;

          let leftMostIndex =
            xShiftFromZeroToLeftMost -
            distanceFromCenterToLeftEdge +
            leftBufferBetweenEdgeAndLastItem;

          let rightMostIndex =
            xShiftFromZeroToRightMost -
            distanceFromCenterToRightEdge +
            rightBufferBetweenEdgeAndLastItem;

          let validLeftMove = val > 0 && temp < leftMostIndex,
            validRightMove = val < 0 && temp > rightMostIndex;

          if (initial || validLeftMove || validRightMove) {
            componentInfoXIndex = temp;
            contentViz.transform(m).render();
          } else {
            leftPan = false;
            rightPan = false;
          }
        },
        panLeft = function() {
          if (leftPan) {
            pan(10);
            //we use this as we want to keep panning as long as the user holds the mouse down
            setTimeout(panLeft, 100);
          }
        },
        panRight = function() {
          if (rightPan) {
            pan(-10);
            //we use this as we want to keep panning as long as the user holds the mouse down
            setTimeout(panRight, 100);
          }
        };

      panWrapper
        .add(pv.Dot)
        .left(config.contentWidth - 7)
        .top(15 + panTop)
        .fillStyle(bgBlue)
        .strokeStyle(darkGrey)
        .angle(-Math.PI / 2)
        .shape("triangle")
        .lineWidth(1)
        .size(30)
        .cursor("pointer")
        .events("all")
        .event("mouseover", function() {
          this.fillStyle(darkGrey).render();
        })
        .event("mouseout", function() {
          this.fillStyle(bgBlue).render();
          rightPan = false;
        })
        .event("mousedown", function() {
          rightPan = true;
          setTimeout(panRight, 0);
        })
        .event("mouseup", function() {
          rightPan = false;
        });

      panWrapper
        .add(pv.Dot)
        .left(7)
        .top(15 + panTop)
        .fillStyle(bgBlue)
        .strokeStyle(darkGrey)
        .angle(Math.PI / 2)
        .shape("triangle")
        .lineWidth(1)
        .size(30)
        .cursor("pointer")
        .event("all")
        .events("all")
        .event("mouseover", function() {
          this.fillStyle(darkGrey).render();
        })
        .event("mouseout", function() {
          this.fillStyle(bgBlue).render();
          leftPan = false;
        })
        .event("mousedown", function() {
          leftPan = true;
          setTimeout(panLeft, 0);
        })
        .event("mouseup", function() {
          leftPan = false;
        });

      return pan;
    }

    function createHighlights(vizContent, config) {
      let inner = vizContent.add(pv.Panel).def("i", -1);
      componentInfoBars = inner.add(pv.Bar);
      let labels = componentInfoBars
        .anchor("bottom")
        .add(pv.Label)
        .visible(function() {
          return config.data.currentVersionIndex === this.index;
        })
        .textAlign("center")
        .textBaseline("top");
      let leftPositionFn = getLeftPositionFn(config);
      componentInfoSelectedIndex = null;

      highlightPanel = componentInfoBars;
      //the highlight sections
      componentInfoBars
        .data(config.data.versions)
        .width(config.spacer - 1)
        .left(function() {
          return config.left + leftPositionFn(this.index) - 1;
          //though we don't show the stroke, we need the strokeStyle to catch events within it
        })
        .top(config.topPadding)
        .height(defaults.partialDisplay ? config.height : config.height - 20)
        .lineWidth(0)
        .strokeStyle(bgBlue)
        .fillStyle("transparent")
        .events("all")
        .event("mouseover", function() {
          inner.i(this.index);
          this.render();
          labels
            .visible(function() {
              return inner.i() === this.index;
            })
            .render();
        })
        .event("mouseout", function() {
          inner.i(-1);
          this.render();
          labels
            .visible(function() {
              return config.data.currentVersionIndex === this.index;
            })
            .render();
        })
        .fillStyle(function() {
          if (inner.i() === this.index) {
            return pv.color("rgba(153, 204, 255, 0.5)");
          } else if (this.index === componentInfoSelectedIndex) {
            return pv.color("rgba(10, 10, 10, 0.15)");
          } else {
            return "transparent";
          }
        })
        .strokeStyle(function() {
          if (this.index === componentInfoSelectedIndex) {
            return pv.color("rgba(10, 10, 10, 0.5)");
          }
          return pv.color("rgba(255, 255, 255,0.1)"); // Shennanigans to ensure Protovis creates invisible elements that have listeners attached
        })
        .lineWidth(1);
      console.log("config.selectable", config.selectable);
      if (config.selectable) {
        componentInfoSelectedIndex = config.data.currentVersionIndex;
        componentInfoBars.event("click", function() {
          console.log("click", this.data(), this);
          
          

          config.versionClick(this.data());
          componentInfoSelectedIndex = this.index;
          this.render();
        });
        componentInfoBars.event("dblclick", function() {
          console.log("dblclick", this.data(), this);
          config.versionDblClick(this.data());
        });
      }
    }

    function createPopularityPanel(vis, config) {
      var data = config.data,
        maxValue = 1,
        nextMajorRevIndex = data.versionPopularity.length,
        leftPositionFn = getLeftPositionFn(config),
        inner = vis.add(pv.Panel),
        barHeight = config.barHeight - 3;

      inner
        .width(config.width)
        .height(config.barHeight)
        .top(config.top)
        .left(config.left);

      //find the max value, to create relative sized bars
      $.each(data.versionPopularity, function(index, item) {
        maxValue = Math.max(maxValue, item);
      });
      maxValue = 1 / maxValue;

      //find the next major rev, we will color everything up to that point differently than everything after
      $.each(data.majorRevIndices, function(index, item) {
        if (item > data.currentVersionIndex) {
          nextMajorRevIndex = item;
          return false;
        }
      });

      inner
        .add(pv.Bar)
        .data(data.versionPopularity)
        .width(config.barWidth)
        .left(function() {
          return leftPositionFn(this.index);
        })
        .height(function(d) {
          //Note that i use a min height of 3 here as no bar looks silly
          return barHeight * d * maxValue + 3;
        })
        .bottom(0)
        .fillStyle(function() {
          return this.index < data.currentVersionIndex
            ? "#a8a9ad"
            : this.index >= nextMajorRevIndex
            ? "#6d97d0"
            : this.index === data.currentVersionIndex
            ? "#58585a"
            : "#8bc73e";
        });

      //the bottom rule just under the bars
      inner
        .add(pv.Rule)
        .width(config.contentActualWidth + config.barGap)
        .bottom(0)
        .left(0)
        .strokeStyle("#949599");
      config.top += config.barHeight + config.spacer;

      return vis;
    }

    function fillRow(vis, config, color, fillBorder) {
      var inner = vis
        .add(pv.Panel)
        .width(config.width)
        .top(config.top)
        .height(config.spacer)
        .left(3);
      var borderWidth =
        config.barWidth + config.barGap - (fillBorder ? 0 : 1.5);

      inner
        .add(pv.Bar)
        .top(1)
        .data(config.vGridLines)
        .width(borderWidth)
        .height(borderWidth)
        .left(function() {
          return this.data() - 2;
        })
        .fillStyle(color);
    }

    function createPolicyThreatPanel(vis, config, category) {
      var inner = vis
        .add(pv.Panel)
        .width(config.width)
        .top(config.top - config.spacer)
        .height(config.spacer)
        .left(config.left);

      inner
        .add(pv.Bar)
        .top(config.barGap / 2)
        .data(config.data.policyThreatLevels[category])
        .width(config.barWidth)
        .height(config.barWidth)
        .left(function() {
          return getLeftPositionFn(config)(this.index);
        })
        .fillStyle(function(d) {
          switch (d) {
            case 0:
              return red;
            case 1:
              return orange;
            case 2:
              return yellow;
            case 3:
              return blue;
            default:
              return;
          }
        })
        .strokeStyle(function(d) {
          switch (d) {
            case 0:
              return red;
            case 1:
              return orange;
            case 2:
              return yellow;
            case 3:
              return blue;
            default:
              return;
          }
        });

      config.top += config.spacer;

      return vis;
    }

    function createPolicyThreatDetailRow(vizLabels, vis, config, category) {
      vizLabels
        .add(pv.Label)
        .left(28)
        .top(config.top + 1)
        .textAlign("left")
        .text(category);
      createPolicyThreatPanel(vis, config, category.toUpperCase());
    }

    function toggleThreatCategories(config, vizLabels, vizContent) {
      showThreatCategories = !showThreatCategories;

      // the extra +1 on the actualHeight prevents shifting when toggling
      const actualHeight = showThreatCategories
        ? config.actualHeight + 1
        : config.noCategoriesActualHeight;
      const height = showThreatCategories
        ? config.height
        : config.noCategoriesHeight;
      const verticalBarHeight = height - 20;

      // adjust the vertical version bar and vertical rule
      highlightPanel.height(verticalBarHeight).render();
      verticalRule.height(verticalBarHeight).render();

      vizLabels.height(actualHeight).render();
      $("#aiVersionChartContainer").height(actualHeight);
      $("#aiVersionChartViz").height(actualHeight);
      vizContent.render();
    }

    function loadVersionChart(config) {
                                        var gridLines = [],
                                          node = $("#aiVersionChartContainer"),
                                          panWrapper,
                                          panningFn,
                                          vizLabels,
                                          vizContent,
                                          i;
                                        componentInfoVizContent = null;

                                        showThreatCategories = true;
                                        config = $.extend({}, defaults, config);

                                        if (node.length === 0) {
                                          return;
                                        }

                                        $.each(derivedValues, function(
                                          name,
                                          fn
                                        ) {
                                          config[name] = fn.call(
                                            derivedValues,
                                            config
                                          );
                                        });

                                        node.height(config.actualHeight);

                                        //create the main viz container with the blue background
                                        vizLabels = new pv.Panel()
                                          .canvas("aiVersionChartLabels")
                                          .overflow("hidden")
                                          .height(config.actualHeight)
                                          .width(config.labelWidth)
                                          .fillStyle(bgBlue)
                                          .strokeStyle(bgBlue);

                                        //create the inner panel
                                        vizContent = new pv.Panel()
                                          .canvas("aiVersionChartViz")
                                          .overflow("hidden")
                                          .height(config.actualHeight)
                                          .width(config.contentWidth)
                                          .fillStyle(bgBlue)
                                          .strokeStyle(bgBlue);

                                        if (config.panning) {
                                          panWrapper = vizContent;
                                          vizContent = panWrapper
                                            .add(pv.Panel)
                                            .overflow("hidden")
                                            .height(config.actualHeight)
                                            .width(config.contentWidth - 30)
                                            .fillStyle(bgBlue)
                                            .strokeStyle(bgBlue)
                                            .left(15);
                                        }

                                        // Horizontal gridlines
                                        for (
                                          i = 0;
                                          i <=
                                          config.spacer * config.contentRows;
                                          i += config.spacer
                                        ) {
                                          gridLines.push(i);
                                        }
                                        vizContent
                                          .add(pv.Rule)
                                          .data(gridLines)
                                          .left(0)
                                          .width(config.width)
                                          .top(function(d) {
                                            return d + config.topPadding;
                                          })
                                          .height(1)
                                          .strokeStyle(gridLine)
                                          .strokeDasharray("1 1");

                                        // Vertical gridlines
                                        config.vGridLines = [0];

                                        for (
                                          i =
                                            ((config.width / 2 - 1) %
                                              config.spacer) -
                                            config.spacer / 2 -
                                            0.5;
                                          i < config.width;
                                          i += config.spacer
                                        ) {
                                          config.vGridLines.push(i);
                                        }
                                        vizContent
                                          .add(pv.Rule)
                                          .data(config.vGridLines)
                                          .left(function(d) {
                                            return d;
                                          })
                                          .height(
                                            config.height - config.topPadding
                                          )
                                          .top(config.top)
                                          .strokeStyle(gridLine)
                                          .strokeDasharray("1 1");

                                        // fill in default heatmap rows
                                        $.each(
                                          config.partialDisplay
                                            ? []
                                            : [6, 8, 9, 10, 11],
                                          function(index, row) {
                                            fillRow(
                                              vizContent,
                                              $.extend({}, config, {
                                                top:
                                                  config.top +
                                                  (row - 1) * config.spacer
                                              }),
                                              lightGrey
                                            );
                                          }
                                        );

                                        // fill in empty rows
                                        $.each(
                                          config.partialDisplay
                                            ? []
                                            : [4, 5, 7, 12],
                                          function(index, row) {
                                            fillRow(
                                              vizContent,
                                              $.extend({}, config, {
                                                top:
                                                  config.top +
                                                  (row - 1) * config.spacer
                                              }),
                                              bgBlue,
                                              true
                                            );
                                          }
                                        );

                                        if (config.versionCount !== 0) {
                                          //the current version vertical rule
                                          verticalRule = vizContent
                                            .add(pv.Rule)
                                            .left(config.width / 2 - 1)
                                            .top(config.topPadding)
                                            .height(
                                              config.height - config.topPadding
                                            )
                                            .strokeStyle("#949599");

                                          //put in the version labels
                                          vizContent
                                            .add(pv.Label)
                                            .left(config.width / 2 - 70)
                                            .top(15)
                                            .textAlign("center")
                                            .text("Older");
                                          vizContent
                                            .add(pv.Label)
                                            .left(config.width / 2)
                                            .top(15)
                                            .textAlign("center")
                                            .text("This Version");
                                          vizContent
                                            .add(pv.Label)
                                            .left(config.width / 2 + 70)
                                            .top(15)
                                            .textAlign("center")
                                            .text("Newer");
                                        }
                                        vizLabels
                                          .add(pv.Label)
                                          .left(5)
                                          .top(config.top + config.labelTop)
                                          .textAlign("left")
                                          .font("bold 10px arial")
                                          .text("Popularity");
                                        config.top += 1;
                                        createPopularityPanel(
                                          vizContent,
                                          config
                                        );

                                        config.top += config.spacer * 2 + 1;
                                        vizLabels
                                          .add(pv.Label)
                                          .left(5)
                                          .top(config.top + 1)
                                          .textAlign("left")
                                          .font("bold 10px arial")
                                          .text("Policy Threat");

                                        createPolicyThreatPanel(
                                          vizContent,
                                          config,
                                          "HIGHEST_THREAT"
                                        );

                                        vizLabels
                                          .add(pv.Label)
                                          .left(15)
                                          .top(config.top + 1)
                                          .textAlign("left")
                                          .font("10px arial")
                                          .text("Details")
                                          .textDecoration("underline")
                                          .textStyle(blue)
                                          .cursor("pointer")
                                          .event("all")
                                          .events("all")
                                          .event("click", function() {
                                            toggleThreatCategories(
                                              config,
                                              vizLabels,
                                              vizContent
                                            );
                                            this.text(
                                              showThreatCategories
                                                ? "Hide Details"
                                                : "Details"
                                            ).render();
                                            return;
                                          });

                                        //these values are all hidden unless paid for
                                        if (!config.partialDisplay) {
                                          config.top += config.spacer; // skip past the details link
                                          createPolicyThreatDetailRow(
                                            vizLabels,
                                            vizContent,
                                            config,
                                            "Security"
                                          );
                                          createPolicyThreatDetailRow(
                                            vizLabels,
                                            vizContent,
                                            config,
                                            "License"
                                          );
                                          createPolicyThreatDetailRow(
                                            vizLabels,
                                            vizContent,
                                            config,
                                            "Quality"
                                          );
                                          createPolicyThreatDetailRow(
                                            vizLabels,
                                            vizContent,
                                            config,
                                            "Other"
                                          );
                                        }

                                        if (config.versionCount === 0) {
                                          _createLabel(vizContent, "No Data", {
                                            width: config.contentWidth,
                                            height: config.actualHeight
                                          });
                                          vizLabels.render();
                                          vizContent.render();
                                          return;
                                        }

                                        createHighlights(vizContent, config);

                                        if (config.panning) {
                                          //add in the panning controls
                                          panningFn = createPanControls(
                                            vizLabels,
                                            vizContent,
                                            panWrapper,
                                            config
                                          );
                                          config.contentWidth -= 15;
                                        }

                                        toggleThreatCategories(
                                          config,
                                          vizLabels,
                                          vizContent
                                        );
                                        //CPT Hack to expand the Threat Categories out to show it
                                        //Also I want to hack mouse event over the the current version to display the tooltip
                                        toggleThreatCategories(
                                          config,
                                          vizLabels,
                                          vizContent
                                        );

                                        //automatically pan to the center current version of the dataset
                                        if (config.panning) {
                                          //here we need to move the panel so that the center is centered in the viewable panel
                                          panningFn(
                                            -(
                                              config.width / 2 -
                                              config.contentWidth +
                                              config.contentWidth / 2
                                            )
                                          );
                                        }
                                        componentInfoVizContent = vizContent;
                                        componentInfoConfig = config;
                                      }

    return function(config) {
      componentInfoXIndex = 0;
      componentInfoVizContent = null;
      componentInfoXIndexInitial = null;
      componentInfoConfig = null;
      console.log("config.data", config.data);
      config.data = parseJsonData(config.data);
      loadVersionChart(config);
    };
  })();

  function updateBars(index) {
    //X axis indexes are inverted, as you move right indexes decrease, therefore the shift from current
    //version is multiplied by -1
    let versionCountToShiftFromCurrentVersion =
        index - componentInfoConfig.data.currentVersionIndex,
      xAxisShiftFromCurrentVersion =
        versionCountToShiftFromCurrentVersion *
        componentInfoConfig.itemWidth *
        -1,
      xAxisShiftAlreadyMoved = componentInfoXIndex - componentInfoXIndexInitial,
      requiredXIndexMove =
        xAxisShiftFromCurrentVersion - xAxisShiftAlreadyMoved;
    panToXIndex(requiredXIndexMove);
    componentInfoSelectedIndex = index;
    componentInfoBars.render();
  }

  function panToXIndex(val) {
    let m = componentInfoVizContent.transform().translate(val, 0),
      temp = componentInfoXIndex + val;
    //Only pan the graph if the new x index is one of the last two displayed versions on either side of the graph currently
    //Or if the new x index is not on the display at all.
    if (
      Math.abs(temp - componentInfoXIndex) >
      componentInfoConfig.contentWidth / 2 - componentInfoConfig.itemWidth * 2
    ) {
      componentInfoXIndex = temp;
      componentInfoVizContent.transform(m).render();
    }
  }

  $.extend(true, window, {
    HealthCheck: {
      getAge: getAge,
      artifactsChart: artifactsChart,
      licenseChart: licenseChart,
      donutChart: donutChart,
      punchCard: punchCard
    },
    Insight: {
      ComponentInformation: ComponentInformation,
      updateBars: updateBars
    }
  });
})();
