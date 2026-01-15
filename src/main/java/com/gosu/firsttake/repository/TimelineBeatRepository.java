package com.gosu.firsttake.repository;

import com.gosu.firsttake.domain.TimelineBeat;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimelineBeatRepository extends JpaRepository<TimelineBeat, Long> {
    List<TimelineBeat> findByProjectIdOrderByOrderIndexAsc(Long projectId);
    void deleteByProjectId(Long projectId);

    @Query("select coalesce(max(b.orderIndex), -1) from TimelineBeat b where b.project.id = :projectId")
    int findMaxOrderIndex(@Param("projectId") Long projectId);

    List<TimelineBeat> findByIdIn(Collection<Long> ids);
}
