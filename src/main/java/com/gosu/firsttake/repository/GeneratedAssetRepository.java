package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.AssetType;
import com.gosu.firsttake.domain.GeneratedAsset;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GeneratedAssetRepository extends JpaRepository<GeneratedAsset, Long> {
    List<GeneratedAsset> findByBeatIdIn(Collection<Long> beatIds);
    List<GeneratedAsset> findByProjectIdAndAssetTypeOrderByCreatedAtDesc(Long projectId, AssetType assetType);
    List<GeneratedAsset> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<GeneratedAsset> findByCreatedByUserIdAndAssetTypeOrderByCreatedAtDesc(Long userId, AssetType assetType);
    List<GeneratedAsset> findByCreatedByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByBeatId(Long beatId);
    void deleteByBeatIdAndAssetType(Long beatId, AssetType assetType);
    void deleteByProjectId(Long projectId);
    Optional<GeneratedAsset> findTop1ByProjectIdOrderByCreatedAtDesc(Long projectId);
    Optional<GeneratedAsset> findTop1ByProjectIdAndAssetTypeOrderByCreatedAtDesc(Long projectId, AssetType assetType);
    Optional<GeneratedAsset> findByIdAndProjectUserId(Long id, Long userId);

    @Modifying
    @Query("update GeneratedAsset asset set asset.beat = null where asset.beat.id = :beatId")
    int clearBeatId(@Param("beatId") Long beatId);

    @Query("select asset.project.id, count(asset) from GeneratedAsset asset where asset.project.id in :projectIds group by asset.project.id")
    List<Object[]> countByProjectIds(@Param("projectIds") Collection<Long> projectIds);
}
