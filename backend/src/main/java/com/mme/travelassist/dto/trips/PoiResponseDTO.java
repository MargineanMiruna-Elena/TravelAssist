package com.mme.travelassist.dto.trips;

import lombok.Data;

@Data
public class PoiResponseDTO {
    public String xid;
    public String name;
    public String kinds;
    public Point point;

    @Data
    public static class Point {
        public Double lat;
        public Double lon;
    }
}
