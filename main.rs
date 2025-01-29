use ethers::{prelude::*, providers::Provider, types::Address};
use mongodb::{bson::doc, options::ClientOptions, Client};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use warp::Filter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // MongoDB setup
    let client_options = ClientOptions::parse("mongodb://localhost:27017").await?;
    let client = Client::with_options(client_options)?;
    let db = client.database("house_renting");
    let collection = db.collection::<House>("houses");

    // Ethereum setup
    let provider = Provider::<Http>::try_from("https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID")?;
    let wallet: LocalWallet = "YOUR_PRIVATE_KEY".parse()?;
    let wallet = wallet.with_chain_id(5u64); // Goerli testnet
    let client = Arc::new(SignerMiddleware::new(provider, wallet));

    // Warp server routes
    let list_route = warp::path("list")
        .and(warp::body::json())
        .and_then(move |house: House| {
            let collection = collection.clone();
            async move {
                collection.insert_one(house, None).await.unwrap();
                Ok::<_, warp::Rejection>(warp::reply::json(&"House listed successfully"))
            }
        });

    let routes = list_route;

    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;

    Ok(())
}

#[derive(Serialize, Deserialize)]
struct House {
    id: u64,
    details: String,
    rent: f64,
    owner: String,
    is_available: bool,
}
