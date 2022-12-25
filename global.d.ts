import { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartData, ChartItem } from "./lib/chart.js/dist/types/index";

declare global {
  declare class Chart {
    data: ChartData;

    constructor(item: ChartItem, config: ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>);

    update(): void;
  }
}
