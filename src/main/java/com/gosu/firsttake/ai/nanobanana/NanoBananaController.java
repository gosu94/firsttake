package com.gosu.firsttake.ai.nanobanana;

import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/nano-banana")
public class NanoBananaController {
    private static final List<String> ASPECT_RATIOS = List.of(
        "21:9",
        "16:9",
        "3:2",
        "4:3",
        "5:4",
        "1:1",
        "4:5",
        "3:4",
        "2:3",
        "9:16"
    );
    private static final List<String> OUTPUT_FORMATS = List.of("png", "jpeg", "webp");

    private final NanoBananaService nanoBananaService;

    public NanoBananaController(NanoBananaService nanoBananaService) {
        this.nanoBananaService = nanoBananaService;
    }

    @GetMapping
    public String showForm(Model model) {
        if (!model.containsAttribute("form")) {
            model.addAttribute("form", new NanoBananaForm());
        }
        populateOptions(model);
        return "nano-banana";
    }

    @PostMapping
    public String generate(@ModelAttribute("form") NanoBananaForm form, Model model) {
        String prompt = form.getPrompt();
        if (prompt == null || prompt.isBlank()) {
            model.addAttribute("error", "Prompt is required.");
            populateOptions(model);
            return "nano-banana";
        }

        try {
            NanoBananaResult result = nanoBananaService.generate(form);
            model.addAttribute("result", result);
        } catch (Exception ex) {
            log.error("Nano Banana generation failed", ex);
            model.addAttribute("error", "Failed to generate image. Check FAL_KEY and try again.");
        }

        populateOptions(model);
        return "nano-banana";
    }

    private void populateOptions(Model model) {
        model.addAttribute("aspectRatios", ASPECT_RATIOS);
        model.addAttribute("outputFormats", OUTPUT_FORMATS);
    }
}
