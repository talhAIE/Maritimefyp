"""LSTM autoencoder architecture (matches Notebook/Maritime.ipynb)."""

from __future__ import annotations

import torch
from torch import nn


class LSTMAutoencoder(nn.Module):
    def __init__(
        self,
        seq_len: int,
        n_features: int,
        embedding_dim: int = 128,
    ) -> None:
        super().__init__()
        self.seq_len = seq_len
        self.n_features = n_features
        self.embedding_dim = embedding_dim

        self.encoder_lstm = nn.LSTM(
            input_size=n_features,
            hidden_size=self.embedding_dim,
            num_layers=1,
            batch_first=True,
        )
        self.decoder_lstm = nn.LSTM(
            input_size=self.embedding_dim,
            hidden_size=self.embedding_dim,
            num_layers=1,
            batch_first=True,
        )
        self.output_layer = nn.Linear(self.embedding_dim, n_features)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        _, (hidden_n, _) = self.encoder_lstm(x)
        hidden_vector = hidden_n.squeeze(0)
        repeated = hidden_vector.unsqueeze(1).repeat(1, self.seq_len, 1)
        decoder_out, _ = self.decoder_lstm(repeated)
        return self.output_layer(decoder_out)
