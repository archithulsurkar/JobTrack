
import { Component, ElementRef, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { JobService } from '../services/job.service';

@Component({
  selector: 'app-stats-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
      <h3 class="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Application Status</h3>
      <div #chartContainer class="w-full flex justify-center"></div>
      
      <!-- Custom Legend -->
      <div class="mt-4 flex flex-wrap gap-2 w-full text-xs justify-center">
        @for (item of legendData; track item.label) {
          <div class="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <span class="w-2.5 h-2.5 rounded-full" [style.background-color]="item.color"></span>
            <span class="text-slate-600 font-medium">{{ item.label }}: {{ item.value }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class StatsChartComponent {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private jobService = inject(JobService);

  legendData: {label: string, value: number, color: string}[] = [];

  // Color palette for dynamic stages
  private colors = [
    '#94a3b8', // slate-400 (Saved/Default)
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ];

  constructor() {
    effect(() => {
      const stats = this.jobService.stats();
      if (this.chartContainer) {
        this.renderChart(stats);
      }
    });
  }

  private renderChart(stats: any) {
    const byStage = stats.byStage;
    const stages = Object.keys(byStage);
    
    // Map stages to data format
    const data = stages
      .map((stage, index) => ({
        label: stage,
        value: byStage[stage],
        color: this.colors[index % this.colors.length]
      }))
      .filter(d => d.value > 0);

    this.legendData = data;

    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    if (data.length === 0) {
      d3.select(element).append('p').text('No data yet').attr('class', 'text-slate-400 text-sm py-8');
      return;
    }

    const width = 180;
    const height = 180;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<any>().value(d => d.value);
    const arc = d3.arc<any>().innerRadius(radius * 0.6).outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => d.data.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    // Add total count in center
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text(stats.total)
      .attr('class', 'text-2xl font-bold fill-slate-700');
  }
}
