"use client";

import { AreaClosed, LinePath, Bar } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { scaleTime, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";

export interface ChartDataPoint {
    date: Date;
    value: number;
}

interface ChartCardProps {
    title: string;
    data: ChartDataPoint[];
    type?: "area" | "line" | "bar";
    gradient?: string;
    height?: number;
    showGrid?: boolean;
    showAxes?: boolean;
}

export default function ChartCard({
    title,
    data,
    type = "area",
    gradient = "from-blue-500 to-cyan-500",
    height = 200,
    showGrid = true,
    showAxes = false,
}: ChartCardProps) {
    const width = 600; // Will be responsive via parent container
    const margin = { top: 20, right: 20, bottom: showAxes ? 40 : 20, left: showAxes ? 50 : 20 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = scaleTime({
        domain: [Math.min(...data.map((d) => new Date(d.date)?.getTime() ?? 0)), Math.max(...data.map((d) => new Date(d.date)?.getTime() ?? 0))],
        range: [0, innerWidth],
    });

    const yScale = scaleLinear({
        domain: [0, Math.max(...data.map((d) => d.value)) * 1.1],
        range: [innerHeight, 0],
        nice: true,
    });

    if (data.length === 0) {
        return (
            <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No data available
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="w-full overflow-x-auto">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                    <LinearGradient id={`gradient-${title}`} from="#3b82f6" to="#06b6d4" />
                    <Group left={margin.left} top={margin.top}>
                        {showGrid && (
                            <>
                                <GridRows
                                    scale={yScale}
                                    width={innerWidth}
                                    strokeDasharray="3,3"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeOpacity={0.3}
                                />
                                <GridColumns
                                    scale={xScale}
                                    height={innerHeight}
                                    strokeDasharray="3,3"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeOpacity={0.3}
                                />
                            </>
                        )}

                        {type === "area" && (
                            <AreaClosed
                                data={data}
                                x={(d) => xScale(d.date) ?? 0}
                                y={(d) => yScale(d.value) ?? 0}
                                yScale={yScale}
                                strokeWidth={2}
                                stroke={`url(#gradient-${title})`}
                                fill={`url(#gradient-${title})`}
                                fillOpacity={0.2}
                                curve={curveMonotoneX}
                            />
                        )}

                        {type === "line" && (
                            <LinePath
                                data={data}
                                x={(d) => xScale(d.date) ?? 0}
                                y={(d) => yScale(d.value) ?? 0}
                                stroke={`url(#gradient-${title})`}
                                strokeWidth={2}
                                curve={curveMonotoneX}
                            />
                        )}

                        {type === "bar" && (
                            <>
                                {data.map((d, i) => {
                                    const barWidth = innerWidth / data.length - 4;
                                    const barHeight = innerHeight - (yScale(d.value) ?? 0);
                                    const barX = (xScale(d.date) ?? 0) - barWidth / 2;
                                    const barY = yScale(d.value) ?? 0;

                                    return (
                                        <Bar
                                            key={i}
                                            x={barX}
                                            y={barY}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={`url(#gradient-${title})`}
                                            opacity={0.8}
                                        />
                                    );
                                })}
                            </>
                        )}

                        {showAxes && (
                            <>
                                <AxisBottom
                                    top={innerHeight}
                                    scale={xScale}
                                    stroke="rgba(255,255,255,0.2)"
                                    tickStroke="rgba(255,255,255,0.2)"
                                    tickLabelProps={() => ({
                                        fill: "rgba(255,255,255,0.6)",
                                        fontSize: 10,
                                        textAnchor: "middle",
                                    })}
                                />
                                <AxisLeft
                                    scale={yScale}
                                    stroke="rgba(255,255,255,0.2)"
                                    tickStroke="rgba(255,255,255,0.2)"
                                    tickLabelProps={() => ({
                                        fill: "rgba(255,255,255,0.6)",
                                        fontSize: 10,
                                        textAnchor: "end",
                                    })}
                                />
                            </>
                        )}
                    </Group>
                </svg>
            </div>
        </div>
    );
}
