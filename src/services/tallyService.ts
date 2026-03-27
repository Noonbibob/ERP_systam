
export interface TallyConfig {
  url: string;
  company: string;
}

export const tallyService = {
  getConfig: (): TallyConfig => {
    const saved = localStorage.getItem('tally_config');
    return saved ? JSON.parse(saved) : { url: 'http://localhost:9000', company: '' };
  },

  saveConfig: (config: TallyConfig) => {
    localStorage.setItem('tally_config', JSON.stringify(config));
  },

  fetchStockItems: async (): Promise<any[]> => {
    const config = tallyService.getConfig();
    const xmlRequest = `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Stock Summary</REPORTNAME>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: xmlRequest,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Tally connection failed');
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Tally XML structure for Stock Summary usually contains <DSPSTOCKLEVEL> or similar
      // This is a generic parser for common Tally Stock Summary XML
      const items: any[] = [];
      const stockItems = xmlDoc.getElementsByTagName('DSPSTOCKLEVEL');
      
      for (let i = 0; i < stockItems.length; i++) {
        const node = stockItems[i];
        const name = node.getElementsByTagName('DSPSTKITEM')[0]?.textContent || '';
        const closingBalance = node.getElementsByTagName('DSPSTKOUT')[0]?.textContent || '0';
        
        if (name) {
          items.push({
            name,
            stock: parseFloat(closingBalance.replace(/[^0-9.-]+/g, "")) || 0
          });
        }
      }
      
      return items;
    } catch (error) {
      console.error('Tally Sync Error:', error);
      throw error;
    }
  },

  sendStockAdjustment: async (itemName: string, quantity: number, type: 'Inward' | 'Outward'): Promise<void> => {
    const config = tallyService.getConfig();
    const xmlRequest = tallyService.generateStockAdjustmentXML(itemName, quantity, type);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
        },
        body: xmlRequest,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to send adjustment to Tally');
      const result = await response.text();
      if (result.includes('LINEERROR') || result.includes('ERRORS')) {
        throw new Error('Tally returned an error during adjustment');
      }
    } catch (error) {
      console.error('Tally Adjustment Error:', error);
      throw error;
    }
  },

  // Helper to generate Tally XML for stock adjustment
  generateStockAdjustmentXML: (itemName: string, quantity: number, type: 'Inward' | 'Outward') => {
    // This is a simplified example of a Tally Voucher XML
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Import Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <IMPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Vouchers</REPORTNAME>
            </REQUESTDESC>
            <REQUESTDATA>
              <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="Stock Journal" ACTION="Create">
                  <DATE>20260327</DATE>
                  <VOUCHERTYPENAME>Stock Journal</VOUCHERTYPENAME>
                  <INVENTORYENTRIES.LIST>
                    <STOCKITEMNAME>${itemName}</STOCKITEMNAME>
                    <ISDEEMEDPOSITIVE>${type === 'Inward' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
                    <BILLEDQTY>${quantity}</BILLEDQTY>
                  </INVENTORYENTRIES.LIST>
                </VOUCHER>
              </TALLYMESSAGE>
            </REQUESTDATA>
          </IMPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }
};
