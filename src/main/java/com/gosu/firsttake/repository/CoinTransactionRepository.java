package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.CoinTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoinTransactionRepository extends JpaRepository<CoinTransaction, Long> {
    List<CoinTransaction> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
