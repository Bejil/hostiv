export type PropertyTrafficDateRange = {
  start_date: string
  end_date: string
}

export type PropertyTrafficDailyRow = {
  day: string
  page_views: number
  unique_visitors: number
}

export type PropertyTrafficMonthlyRow = {
  month_key: string
  label: string
  page_views: number
  unique_visitors: number
}

export type PropertyTrafficReport = {
  date_range: PropertyTrafficDateRange
  totals: {
    page_views: number
    unique_visitors: number
  }
  daily: PropertyTrafficDailyRow[]
  monthly: PropertyTrafficMonthlyRow[]
}
