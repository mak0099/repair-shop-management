export default function CurrentBalancePage() {
  // Dummy data for stock valuation
  const stockData = {
    stockPurchase: 125000, // Total cost value
    stockOnlinePrice: 180000, // Potential revenue at online prices
    stockDesktopPrice: 165000, // Potential revenue at desktop prices
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Current Balance</h1>
        <p className="text-muted-foreground">Real-time overview of inventory value</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stock Purchase</h3>
          </div>
          <div className="text-2xl font-bold">${stockData.stockPurchase.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total cost value of current inventory
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stock Online Price</h3>
          </div>
          <div className="text-2xl font-bold">${stockData.stockOnlinePrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Potential revenue at online prices
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Stock Desktop Price</h3>
          </div>
          <div className="text-2xl font-bold">${stockData.stockDesktopPrice.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Potential revenue at desktop prices
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Current Stock Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Stock Purchase Value</span>
              <span className="font-bold">${stockData.stockPurchase.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Stock Online Price Value</span>
              <span className="font-bold">${stockData.stockOnlinePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Stock Desktop Price Value</span>
              <span className="font-bold">${stockData.stockDesktopPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}