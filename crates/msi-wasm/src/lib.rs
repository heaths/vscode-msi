// Copyright 2023 Heath Stewart.
// Licensed under the MIT License. See LICENSE.txt in the project root for license information.

use msi::Select;
use serde::Serialize;
use std::collections::HashMap;
use std::fmt::Display;
use std::io::Cursor;
use std::ops::Index;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub struct Package {
    package: msi::Package<Cursor<Vec<u8>>>,
}

#[wasm_bindgen]
impl Package {
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<u8>) -> Result<Package, JsError> {
        log!("Opening package from {} bytes", data.len());
        let cursor = Cursor::new(data);
        let package = msi::Package::open(cursor)?;
        Ok(Package { package })
    }

    #[wasm_bindgen]
    pub fn tables(&self) -> Box<[JsValue]> {
        self.package
            .tables()
            .into_iter()
            .map(|t| <Table as Into<JsValue>>::into(Table::new(t)))
            .collect()
    }

    #[wasm_bindgen]
    pub fn rows(&mut self, table: &str) -> Result<Box<[JsValue]>, JsError> {
        if !self.package.has_table(table) {
            return Err(Error::TableNotFound(table.to_owned()).into());
        }

        // TODO: Measure performance of enumerating tables using web_sys::window()?.performance().
        log!("Enumerating '{}' table", table);
        Ok(self
            .package
            .select_rows(Select::table(table))?
            .into_iter()
            .map(|r| {
                let mut obj = HashMap::with_capacity(r.len());
                for i in 0..r.len() {
                    obj.insert(
                        r.columns()[i].name().to_string(),
                        r.index(i).as_str().map(|s| s.to_string()),
                    );
                }
                let serializer = serde_wasm_bindgen::Serializer::json_compatible();
                obj.serialize(&serializer).unwrap_or_default()
            })
            .collect())
    }
}

#[wasm_bindgen]
pub struct Table {
    name: String,
    columns: Vec<Column>,
}

#[wasm_bindgen]
impl Table {
    fn new(table: &msi::Table) -> Self {
        Table {
            name: table.name().into(),
            columns: table.columns().iter().map(Column::new).collect(),
        }
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen]
    pub fn columns(&self) -> Box<[JsValue]> {
        self.columns
            .as_slice()
            .iter()
            .map(|c| <Column as Into<JsValue>>::into(c.clone()))
            .collect()
    }
}

#[derive(Clone)]
#[wasm_bindgen]
pub struct Column {
    name: String,
    column_type: String,
    category: Option<String>,
    primary_key: bool,
    nullable: bool,
    localizable: bool,
}

#[wasm_bindgen]
impl Column {
    fn new(column: &msi::Column) -> Self {
        Column {
            name: column.name().into(),
            // cspell:ignore coltype
            column_type: format!("{}", column.coltype()),
            category: column.category().map(|c| format!("{}", c)),
            primary_key: column.is_primary_key(),
            nullable: column.is_nullable(),
            localizable: column.is_localizable(),
        }
    }

    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(getter, js_name = "columnType")]
    pub fn column_type(&self) -> String {
        self.column_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn category(&self) -> Option<String> {
        self.category.clone()
    }

    #[wasm_bindgen(getter, js_name = "primaryKey")]
    pub fn primary_key(&self) -> bool {
        self.primary_key
    }

    #[wasm_bindgen(getter)]
    pub fn nullable(&self) -> bool {
        self.nullable
    }

    #[wasm_bindgen(getter)]
    pub fn localizable(&self) -> bool {
        self.localizable
    }
}

#[derive(Debug)]
enum Error {
    Io(std::io::Error),
    TableNotFound(String),
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Io(e) => e.fmt(f),
            Self::TableNotFound(name) => write!(f, "table '{}' not found", name),
        }
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Io(e) => e.source(),
            _ => None,
        }
    }
}

impl From<std::io::Error> for Error {
    fn from(value: std::io::Error) -> Self {
        Error::Io(value)
    }
}
