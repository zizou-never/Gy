const { Client } = require('pg');

exports.handler = async (event, context) => {
  const headers = {
      'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, OPTIONS'
                };

                  if (event.httpMethod === 'OPTIONS') {
                      return {
                            statusCode: 200,
                                  headers,
                                        body: ''
                                            };
                                              }

                                                try {
                                                    const client = new Client({
                                                          connectionString: process.env.DATABASE_URL,
                                                                ssl: {
                                                                        rejectUnauthorized: false
                                                                              }
                                                                                  });

                                                                                      await client.connect();

                                                                                          // Récupérer les statistiques
                                                                                              const statsQuery = `
                                                                                                    SELECT 
                                                                                                            COUNT(DISTINCT id) as total_questions,
                                                                                                                    COUNT(DISTINCT module) as total_modules,
                                                                                                                            COUNT(DISTINCT year) as total_years
                                                                                                                                  FROM questions
                                                                                                                                      `;

                                                                                                                                          const moduleBreakdownQuery = `
                                                                                                                                                SELECT 
                                                                                                                                                        module,
                                                                                                                                                                COUNT(*) as count
                                                                                                                                                                      FROM questions
                                                                                                                                                                            GROUP BY module
                                                                                                                                                                                `;

                                                                                                                                                                                    const [statsResult, moduleResult] = await Promise.all([
                                                                                                                                                                                          client.query(statsQuery),
                                                                                                                                                                                                client.query(moduleBreakdownQuery)
                                                                                                                                                                                                    ]);

                                                                                                                                                                                                        await client.end();

                                                                                                                                                                                                            const moduleBreakdown = {};
                                                                                                                                                                                                                moduleResult.rows.forEach(row => {
                                                                                                                                                                                                                      moduleBreakdown[row.module] = parseInt(row.count);
                                                                                                                                                                                                                          });

                                                                                                                                                                                                                              return {
                                                                                                                                                                                                                                    statusCode: 200,
                                                                                                                                                                                                                                          headers,
                                                                                                                                                                                                                                                body: JSON.stringify({
                                                                                                                                                                                                                                                        totalQuestions: parseInt(statsResult.rows[0].total_questions),
                                                                                                                                                                                                                                                                totalModules: parseInt(statsResult.rows[0].total_modules),
                                                                                                                                                                                                                                                                        totalYears: parseInt(statsResult.rows[0].total_years),
                                                                                                                                                                                                                                                                                moduleBreakdown
                                                                                                                                                                                                                                                                                      })
                                                                                                                                                                                                                                                                                          };

                                                                                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                                                                                console.error('Database error:', error);
                                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                                          statusCode: 500,
                                                                                                                                                                                                                                                                                                                headers,
                                                                                                                                                                                                                                                                                                                      body: JSON.stringify({ error: 'Erreur lors de la récupération des statistiques' })
                                                                                                                                                                                                                                                                                                                          };
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                            };