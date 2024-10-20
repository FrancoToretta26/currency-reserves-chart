import { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const schema = process.env.REDSHIFT_SCHEMA;
    const data = await query(`
      SELECT * FROM "${schema}".reservas_en_pesos
      ORDER BY fecha DESC
      LIMIT 100
    `);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data from Redshift" });
  }
}
